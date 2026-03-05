import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getGeneratedQuotationByNumber } from "../db";
import { generatePdfWithPdfLib } from "../pdfLibGenerator";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // PDF download route - generates PDF on-the-fly from quotation data
  app.get("/api/pdf/:quotationNumber", async (req, res) => {
    try {
      const { quotationNumber } = req.params;
      
      console.log(`[PDF Download] Generating PDF for ${quotationNumber}`);
      
      // Get the quotation from database
      const quotation = await getGeneratedQuotationByNumber(quotationNumber);
      
      if (!quotation) {
        console.error(`[PDF Download] Quotation not found: ${quotationNumber}`);
        return res.status(404).json({ error: "Cotización no encontrada" });
      }
      
      // Generate PDF using pdf-lib (works in any environment without browser dependencies)
      const pdfBuffer = await generatePdfWithPdfLib(quotation);
      
      console.log(`[PDF Download] Generated ${pdfBuffer.length} bytes`);
      
      // Set headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${quotationNumber}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error("[PDF Download] Error:", error);
      res.status(500).json({ error: "Error generando PDF" });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
