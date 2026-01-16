import { pool } from "./db-mysql";
import bcrypt from "bcrypt";
import {
  type InsertTask,
  type UpdateTaskRequest,
  type Task
} from "@shared/schema";

export interface User {
  id: number;
  provider?: string;
  name: string;
  email: string;
  password?: string;
  gmail_address?: string;
  github_link?: string;
  linkedin_link?: string;
  role: "user" | "admin";
  created_at: Date;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  code_block_theme?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IStorage {
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // User operations
  findOrCreateUser(provider: string, email: string, name: string): Promise<User>;
  findUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  setUserRole(userId: number, role: "user" | "admin"): Promise<void>;
  loginWithCredentials(username: string, password: string): Promise<User | undefined>;
  createAdminUser(username: string, password: string, name: string, email: string): Promise<User>;
  registerUser(email: string, password: string, name: string, gmailAddress?: string, githubLink?: string, linkedinLink?: string): Promise<User>;

  // Post operations
  getPosts(): Promise<(Post & { userName: string })[]>;
  getPostById(id: number): Promise<(Post & { userName: string }) | undefined>;
  createPost(userId: number, title: string, content: string, codeBlockTheme?: string): Promise<Post>;
  updatePost(id: number, title: string, content: string): Promise<Post>;
  deletePost(id: number): Promise<void>;
}

export class MySQLStorage implements IStorage {
  public db = pool;
  private tasks: Map<number, Task> = new Map();
  private nextTaskId = 1;

  // In-memory tasks storage (for backward compatibility)
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const task: Task = {
      id: this.nextTaskId++,
      ...insertTask,
      createdAt: new Date(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  async updateTask(id: number, updates: UpdateTaskRequest): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    Object.assign(task, updates);
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }

  // User operations
  async findOrCreateUser(provider: string, email: string, name: string): Promise<User> {
    const conn = await pool.getConnection();
    try {
      // Check if user exists
      const [rows] = await conn.execute<any[]>(
        "SELECT * FROM users WHERE email = ? AND provider = ?",
        [email, provider]
      );

      if (rows.length > 0) {
        return rows[0];
      }

      // Create new user
      const [result] = await conn.execute<any>(
        "INSERT INTO users (provider, provider_id, name, email, role) VALUES (?, ?, ?, ?, ?)",
        [provider, `${provider}_${Date.now()}`, name, email, "user"]
      );

      const [newUser] = await conn.execute<any[]>(
        "SELECT * FROM users WHERE id = ?",
        [result.insertId]
      );

      return newUser[0];
    } finally {
      conn.release();
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      return rows[0];
    } finally {
      conn.release();
    }
  }

  async getUserById(id: number): Promise<User | undefined> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );
      return rows[0];
    } finally {
      conn.release();
    }
  }

  async setUserRole(userId: number, role: "user" | "admin"): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    } finally {
      conn.release();
    }
  }

  async loginWithCredentials(username: string, password: string): Promise<User | undefined> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      
      if (rows.length === 0) {
        return undefined;
      }

      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return undefined;
      }

      return user;
    } finally {
      conn.release();
    }
  }

  async createAdminUser(username: string, password: string, name: string, email: string): Promise<User> {
    const conn = await pool.getConnection();
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await conn.execute<any>(
        "INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)",
        [username, hashedPassword, name, email, "admin"]
      );

      const [newUser] = await conn.execute<any[]>(
        "SELECT * FROM users WHERE id = ?",
        [result.insertId]
      );

      return newUser[0];
    } finally {
      conn.release();
    }
  }

  async registerUser(email: string, password: string, name: string, gmailAddress?: string, githubLink?: string, linkedinLink?: string): Promise<User> {
    const conn = await pool.getConnection();
    try {
      // Check if email already exists
      const [existingUser] = await conn.execute<any[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        throw new Error("Email already registered");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const [result] = await conn.execute<any>(
        "INSERT INTO users (provider, provider_id, name, email, password, gmail_address, github_link, linkedin_link, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ['local', `local_${email}`, name, email, hashedPassword, gmailAddress || null, githubLink || null, linkedinLink || null, "user"]
      );

      const [newUser] = await conn.execute<any[]>(
        "SELECT * FROM users WHERE id = ?",
        [result.insertId]
      );

      return newUser[0];
    } finally {
      conn.release();
    }
  }

  // Post operations
  async getPosts(): Promise<(Post & { userName: string })[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(`
        SELECT p.*, u.name as userName FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `);
      return rows;
    } finally {
      conn.release();
    }
  }

  async getPostById(id: number): Promise<(Post & { userName: string }) | undefined> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(`
        SELECT p.*, u.name as userName FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `, [id]);
      return rows[0];
    } finally {
      conn.release();
    }
  }

  async createPost(userId: number, title: string, content: string, codeBlockTheme: string = 'dark'): Promise<Post> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute<any>(
        "INSERT INTO posts (user_id, title, content, code_block_theme) VALUES (?, ?, ?, ?)",
        [userId, title, content, codeBlockTheme]
      );

      const [rows] = await conn.execute<any[]>(
        "SELECT * FROM posts WHERE id = ?",
        [result.insertId]
      );

      return rows[0];
    } finally {
      conn.release();
    }
  }

  async updatePost(id: number, title: string, content: string): Promise<Post> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "UPDATE posts SET title = ?, content = ? WHERE id = ?",
        [title, content, id]
      );

      const [rows] = await conn.execute<any[]>(
        "SELECT * FROM posts WHERE id = ?",
        [id]
      );

      return rows[0];
    } finally {
      conn.release();
    }
  }

  async deletePost(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("DELETE FROM posts WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }
}

export const storage = new MySQLStorage();
export const DEFAULT_USER_ID = 1;
