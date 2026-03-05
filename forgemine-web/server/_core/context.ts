import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { jwtVerify } from "jose";
import { ENV } from "./env";
import { COOKIE_NAME } from "../../shared/const";
import { parse as parseCookies } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

async function authenticateWithOwnJwt(
  req: CreateExpressContextOptions["req"]
): Promise<User | null> {
  try {
    const cookieHeader = req.headers.cookie ?? "";
    const cookies = parseCookies(cookieHeader);
    const raw = cookies[COOKIE_NAME];
    if (!raw || !raw.startsWith("own.")) return null;

    const token = raw.slice(4);
    const secret = new TextEncoder().encode(ENV.jwtSecret);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "admin") return null;

    return {
      id: "admin",
      openId: "admin",
      role: "admin",
      email: (payload.email as string) ?? ENV.adminEmail,
      name: "Admin",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as User;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = await authenticateWithOwnJwt(opts.req);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
