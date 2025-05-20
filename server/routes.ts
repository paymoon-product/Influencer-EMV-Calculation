import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emvParametersSchema, emvResultSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup API routes
  app.post("/api/emv/calculate", async (req: Request, res: Response) => {
    try {
      // Validate the request body against the schema
      const parameters = emvParametersSchema.parse(req.body);
      
      // Calculate EMV (this is done client-side for now)
      // We store calculations if a user is authenticated
      const userId = req.session?.user?.id || "anonymous";
      
      // Save calculation if userId is not anonymous
      if (userId !== "anonymous") {
        const result = emvResultSchema.parse(req.body.result);
        await storage.saveEmvCalculation(userId, parameters, result);
      }
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to process EMV calculation" });
      }
    }
  });
  
  app.get("/api/emv/history", async (req: Request, res: Response) => {
    try {
      const userId = req.session?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const calculations = await storage.getEmvCalculationsByUser(userId);
      res.json({ calculations });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve EMV calculation history" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
