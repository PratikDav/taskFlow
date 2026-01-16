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

export interface Folder {
  id: number;
  user_id: number;
  name: string;
  created_at: Date;
}

export interface Note {
  id: number;
  user_id: number;
  folder_id?: number;
  title: string;
  content: string;
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

  // Folder operations
  getFolders(userId: number): Promise<Folder[]>;
  getFolderById(id: number): Promise<Folder | undefined>;
  createFolder(userId: number, name: string): Promise<Folder>;
  deleteFolder(id: number): Promise<void>;

  // Note operations
  getNotes(userId: number): Promise<(Note & { folderName?: string })[]>;
  getNoteById(id: number): Promise<(Note & { folderName?: string }) | undefined>;
  createNote(userId: number, title: string, content: string, folderId?: number): Promise<Note>;
  updateNote(id: number, title: string, content: string, folderId?: number): Promise<Note>;
  deleteNote(id: number): Promise<void>;
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

  // Folder operations
  async getFolders(userId: number): Promise<Folder[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id, user_id, name, created_at FROM folders WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
      );
      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        createdAt: row.created_at,
      }));
    } finally {
      conn.release();
    }
  }

  async getFolderById(id: number): Promise<Folder | undefined> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id, user_id, name, created_at FROM folders WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return undefined;
      const row = rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        createdAt: row.created_at,
      };
    } finally {
      conn.release();
    }
  }

  async createFolder(userId: number, name: string): Promise<Folder> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        "INSERT INTO folders (user_id, name) VALUES (?, ?)",
        [userId, name]
      );
      const folderId = result.insertId;
      return {
        id: folderId,
        userId: userId,
        name,
        createdAt: new Date(),
      };
    } finally {
      conn.release();
    }
  }

  async updateFolder(id: number, name: string): Promise<Folder> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("UPDATE folders SET name = ? WHERE id = ?", [name, id]);
      const folder = await this.getFolderById(id);
      if (!folder) throw new Error("Folder not found after update");
      return folder;
    } finally {
      conn.release();
    }
  }

  async deleteFolder(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("DELETE FROM folders WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }

  // Note operations
  async getNotes(userId: number): Promise<(Note & { folderName?: string })[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT n.id, n.user_id, n.folder_id, n.title, n.content, n.created_at, n.updated_at, f.name as folder_name
         FROM notes n
         LEFT JOIN folders f ON n.folder_id = f.id
         WHERE n.user_id = ?
         ORDER BY n.updated_at DESC`,
        [userId]
      );
      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        folderId: row.folder_id,
        title: row.title,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        folderName: row.folder_name,
      }));
    } finally {
      conn.release();
    }
  }

  async getNoteById(id: number): Promise<(Note & { folderName?: string }) | undefined> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT n.id, n.user_id, n.folder_id, n.title, n.content, n.created_at, n.updated_at, f.name as folder_name
         FROM notes n
         LEFT JOIN folders f ON n.folder_id = f.id
         WHERE n.id = ?`,
        [id]
      );
      if (rows.length === 0) return undefined;
      const row = rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        folderId: row.folder_id,
        title: row.title,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        folderName: row.folder_name,
      };
    } finally {
      conn.release();
    }
  }

  async createNote(userId: number, title: string, content: string, folderId?: number): Promise<Note> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        "INSERT INTO notes (user_id, folder_id, title, content) VALUES (?, ?, ?, ?)",
        [userId, folderId || null, title, content]
      );
      const noteId = result.insertId;
      return {
        id: noteId,
        userId: userId,
        folderId: folderId,
        title,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } finally {
      conn.release();
    }
  }

  async updateNote(id: number, title: string, content: string, folderId?: number): Promise<Note> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "UPDATE notes SET title = ?, content = ?, folder_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [title, content, folderId || null, id]
      );
      const note = await this.getNoteById(id);
      if (!note) throw new Error("Note not found after update");
      return note;
    } finally {
      conn.release();
    }
  }

  async deleteNote(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("DELETE FROM notes WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }
}

export const storage = new MySQLStorage();
export const DEFAULT_USER_ID = 1;
