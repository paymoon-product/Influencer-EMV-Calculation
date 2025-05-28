import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// EMV Calculation schema
export const emvCalculations = pgTable("emv_calculations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  parameters: json("parameters").notNull(),
  result: json("result").notNull(),
});

export const insertEmvCalculationSchema = createInsertSchema(emvCalculations).omit({
  id: true,
  date: true,
});

export type InsertEmvCalculation = z.infer<typeof insertEmvCalculationSchema>;
export type EmvCalculation = typeof emvCalculations.$inferSelect;

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Custom topics schema
export const customTopics = pgTable("custom_topics", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  factor: text("factor").notNull(), // Store as text to preserve decimal precision
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertCustomTopicSchema = createInsertSchema(customTopics).omit({
  id: true,
  createdAt: true,
});

export type InsertCustomTopic = z.infer<typeof insertCustomTopicSchema>;
export type CustomTopic = typeof customTopics.$inferSelect;

// EMV calculation parameters schema
export const emvParametersSchema = z.object({
  platform: z.string(),
  postType: z.string(),
  creatorSize: z.string(),
  contentTopic: z.string(),
  // All possible engagement fields are optional
  impressions: z.number().optional(),
  views: z.number().optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
  saves: z.number().optional(),
  clicks: z.number().optional(),
  closeups: z.number().optional(),
});

export const emvResultSchema = z.object({
  platform: z.string(),
  postType: z.string(),
  creatorFactor: z.number(),
  postTypeFactor: z.number(),
  topicFactor: z.number(),
  totalEMV: z.number(),
  breakdown: z.array(
    z.object({
      type: z.string(),
      count: z.number(),
      baseValue: z.number(),
      emv: z.number(),
    })
  ),
});

export type EmvParameters = z.infer<typeof emvParametersSchema>;
export type EmvResult = z.infer<typeof emvResultSchema>;
