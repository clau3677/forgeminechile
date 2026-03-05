import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { trpc } from "../_core/trpc";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const schema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Ingresa tu contrasena"),
});

type FormData = z.infer<typeof schema>;

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { config } = useSiteConfig();

  const loginMutation = trpc.auth.loginWithPassword.useMutation({
    onSuccess: () => {
      navigate("/admin");
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setServerError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          {config?.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.companyName ?? "Logo"}
              className="h-16 w-auto object-contain mb-4"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center mb-4">
              <Lock className="text-white w-8 h-8" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {config?.companyName ?? "Panel de Administracion"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Acceso restringido</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <Label htmlFor="email">Correo electronico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@tuempresa.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Contrasena</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loginMutation.isPending}
          >
            {loginMutation.isPending ? "Iniciando sesion..." : "Iniciar sesion"}
          </Button>
        </form>
      </div>
    </div>
  );
}
