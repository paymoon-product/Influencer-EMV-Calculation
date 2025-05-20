import { 
  User, 
  InsertUser, 
  EmvCalculation, 
  EmvParameters,
  EmvResult,
  users,
  emvCalculations
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Extend the storage interface with methods for EMV calculations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveEmvCalculation(userId: string, parameters: EmvParameters, result: EmvResult): Promise<EmvCalculation>;
  getEmvCalculationsByUser(userId: string): Promise<EmvCalculation[]>;
  getEmvCalculation(id: number): Promise<EmvCalculation | undefined>;
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
}

export const storage = new DatabaseStorage();
