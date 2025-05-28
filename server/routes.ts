import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emvParametersSchema, emvResultSchema } from "@shared/schema";
import { generatePersonalizedInsights, generateSingleCalculationInsight } from "./ai-insights";
import { compareWithBenchmark, getAllBenchmarks, getBenchmarksByPlatform } from "./benchmark-service";
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
      // For this demo we'll use the mock user's ID from the session,
      // or a default ID if session isn't available
      const userId = req.session?.user?.id || "demo-user-1";
      
      const calculations = await storage.getEmvCalculationsByUser(userId);
      res.json({ calculations });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve EMV calculation history" });
    }
  });

  // AI Insights endpoint
  app.get("/api/emv/insights", async (req: Request, res: Response) => {
    try {
      const userId = req.session?.user?.id || "demo-user-1";
      const calculations = await storage.getEmvCalculationsByUser(userId);
      
      if (calculations.length === 0) {
        return res.json({
          summary: "No calculation data available for analysis.",
          insights: [],
          keyMetrics: {
            totalEmv: 0,
            averageEmv: 0,
            topPerformingPlatform: "N/A",
            topPerformingContent: "N/A",
            growthRate: 0
          },
          recommendations: ["Start by creating your first EMV calculation to receive personalized insights."]
        });
      }

      // Check if AI service is available
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.json({
          summary: "AI insights require API configuration. Please set up your Anthropic API key to enable AI-powered analysis.",
          insights: [],
          keyMetrics: {
            totalEmv: calculations.reduce((sum, calc) => sum + (calc.result as any).totalEMV, 0),
            averageEmv: calculations.length > 0 ? calculations.reduce((sum, calc) => sum + (calc.result as any).totalEMV, 0) / calculations.length : 0,
            topPerformingPlatform: "Instagram",
            topPerformingContent: "Posts",
            growthRate: 0
          },
          recommendations: ["Set up AI configuration to unlock detailed insights"]
        });
      }

      const insightsReport = await generatePersonalizedInsights(calculations);
      res.json(insightsReport);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ error: "Failed to generate AI insights" });
    }
  });

  // Single calculation insight endpoint
  app.post("/api/emv/calculation-insight", async (req: Request, res: Response) => {
    try {
      const { calculationId } = req.body;
      
      if (!calculationId) {
        return res.status(400).json({ error: "Calculation ID is required" });
      }

      const calculation = await storage.getEmvCalculation(calculationId);
      
      if (!calculation) {
        return res.status(404).json({ error: "Calculation not found" });
      }

      const insight = await generateSingleCalculationInsight(calculation);
      res.json({ insight });
    } catch (error) {
      console.error("Error generating calculation insight:", error);
      res.status(500).json({ error: "Failed to generate calculation insight" });
    }
  });

  // Benchmark comparison endpoints
  app.post("/api/emv/benchmark-comparison", async (req: Request, res: Response) => {
    try {
      const { calculationId } = req.body;
      
      if (!calculationId) {
        return res.status(400).json({ error: "Calculation ID is required" });
      }

      const calculation = await storage.getEmvCalculation(calculationId);
      if (!calculation) {
        return res.status(404).json({ error: "Calculation not found" });
      }

      const comparison = compareWithBenchmark(calculation);
      if (!comparison) {
        return res.status(404).json({ error: "No benchmark data available for this calculation" });
      }

      res.json(comparison);
    } catch (error) {
      console.error("Error generating benchmark comparison:", error);
      res.status(500).json({ error: "Failed to generate benchmark comparison" });
    }
  });

  app.get("/api/benchmarks", async (req: Request, res: Response) => {
    try {
      const { platform } = req.query;
      
      if (platform) {
        const benchmarks = getBenchmarksByPlatform(platform as string);
        res.json(benchmarks);
      } else {
        const benchmarks = getAllBenchmarks();
        res.json(benchmarks);
      }
    } catch (error) {
      console.error("Error fetching benchmarks:", error);
      res.status(500).json({ error: "Failed to fetch benchmark data" });
    }
  });

  // Custom topics endpoints
  app.post("/api/custom-topics", async (req: Request, res: Response) => {
    try {
      const { name, factor } = req.body;
      const userId = "demo-user"; // Using demo user for now
      
      if (!name || !factor) {
        return res.status(400).json({ error: "Name and factor are required" });
      }

      const topic = await storage.saveCustomTopic(userId, name, factor.toString());
      res.json(topic);
    } catch (error) {
      console.error("Error saving custom topic:", error);
      res.status(500).json({ error: "Failed to save custom topic" });
    }
  });

  app.get("/api/custom-topics", async (req: Request, res: Response) => {
    try {
      const userId = "demo-user"; // Using demo user for now
      const topics = await storage.getCustomTopicsByUser(userId);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching custom topics:", error);
      res.status(500).json({ error: "Failed to fetch custom topics" });
    }
  });

  app.delete("/api/custom-topics/:id", async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.id);
      const userId = "demo-user"; // Using demo user for now
      
      await storage.deleteCustomTopic(userId, topicId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting custom topic:", error);
      res.status(500).json({ error: "Failed to delete custom topic" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
