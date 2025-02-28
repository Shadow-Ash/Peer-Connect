import { IStorage } from "./storage";
import session from "express-session";
import createMemoryStore from "memorystore";
import { User, InsertUser } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async searchUsers(query: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.username.toLowerCase().includes(query.toLowerCase()),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      isOnline: false,
      publicKey: null
    };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
