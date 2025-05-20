import { 
  User, 
  InsertUser, 
  EmvCalculation, 
  EmvParameters,
  EmvResult 
} from "@shared/schema";

// Extend the storage interface with methods for EMV calculations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveEmvCalculation(userId: string, parameters: EmvParameters, result: EmvResult): Promise<EmvCalculation>;
  getEmvCalculationsByUser(userId: string): Promise<EmvCalculation[]>;
  getEmvCalculation(id: number): Promise<EmvCalculation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emvCalculations: Map<number, EmvCalculation>;
  private currentUserId: number;
  private currentEmvCalcId: number;

  constructor() {
    this.users = new Map();
    this.emvCalculations = new Map();
    this.currentUserId = 1;
    this.currentEmvCalcId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveEmvCalculation(userId: string, parameters: EmvParameters, result: EmvResult): Promise<EmvCalculation> {
    const id = this.currentEmvCalcId++;
    const date = new Date();
    
    const calculation: EmvCalculation = {
      id,
      userId,
      date,
      parameters,
      result
    };
    
    this.emvCalculations.set(id, calculation);
    return calculation;
  }

  async getEmvCalculationsByUser(userId: string): Promise<EmvCalculation[]> {
    return Array.from(this.emvCalculations.values())
      .filter(calc => calc.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date, newest first
  }

  async getEmvCalculation(id: number): Promise<EmvCalculation | undefined> {
    return this.emvCalculations.get(id);
  }
}

export const storage = new MemStorage();
