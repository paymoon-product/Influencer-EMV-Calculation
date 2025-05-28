import { 
  User, 
  InsertUser, 
  EmvCalculation, 
  EmvParameters,
  EmvResult,
  CustomTopic,
  InsertCustomTopic,
  users,
  emvCalculations,
  customTopics
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Extend the storage interface with methods for EMV calculations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveEmvCalculation(userId: string, parameters: EmvParameters, result: EmvResult): Promise<EmvCalculation>;
  getEmvCalculationsByUser(userId: string): Promise<EmvCalculation[]>;
  getEmvCalculation(id: number): Promise<EmvCalculation | undefined>;
  saveCustomTopic(userId: string, name: string, factor: string): Promise<CustomTopic>;
  getCustomTopicsByUser(userId: string): Promise<CustomTopic[]>;
  deleteCustomTopic(userId: string, topicId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveEmvCalculation(userId: string, parameters: EmvParameters, result: EmvResult): Promise<EmvCalculation> {
    const [calculation] = await db
      .insert(emvCalculations)
      .values({
        userId,
        parameters,
        result
      })
      .returning();
    return calculation;
  }

  async getEmvCalculationsByUser(userId: string): Promise<EmvCalculation[]> {
    return db
      .select()
      .from(emvCalculations)
      .where(eq(emvCalculations.userId, userId))
      .orderBy(emvCalculations.date);
  }

  async getEmvCalculation(id: number): Promise<EmvCalculation | undefined> {
    const [calculation] = await db
      .select()
      .from(emvCalculations)
      .where(eq(emvCalculations.id, id));
    return calculation || undefined;
  }

  async saveCustomTopic(userId: string, name: string, factor: string): Promise<CustomTopic> {
    const [topic] = await db
      .insert(customTopics)
      .values({ userId, name, factor })
      .returning();
    return topic;
  }

  async getCustomTopicsByUser(userId: string): Promise<CustomTopic[]> {
    return await db.select().from(customTopics).where(eq(customTopics.userId, userId));
  }

  async deleteCustomTopic(userId: string, topicId: number): Promise<void> {
    await db.delete(customTopics).where(
      and(eq(customTopics.userId, userId), eq(customTopics.id, topicId))
    );
  }
}

export const storage = new DatabaseStorage();
