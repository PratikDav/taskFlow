import { pool } from "./db-mysql";
import bcrypt from "bcrypt";
import {
  type InsertTask,
  type UpdateTaskRequest,
  type Task,
  type InsertNotification,
<<<<<<< HEAD
  type UpdateNotificationRequest,
  type InsertShare,
  type Share,
  type InsertSavedPost,
  type SavedPost,
  type InsertBugReport,
  type UpdateBugReportRequest,
  type BugReport
<<<<<<< HEAD
=======
=======
  type Notification,
  type UpdateNotificationRequest
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
} from "@shared/schema";

export interface User {
  id: number;
  provider?: string;
  name: string;
  email: string;
  password?: string;
  designation?: string;
  gmail_address?: string;
  github_link?: string;
  linkedin_link?: string;
  avatar?: string;
  avatar_original?: string;
  avatar_crop?: string | null;
  role: "user" | "admin";
  created_at: Date;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  code_block_theme?: string;
  privacy: 'public' | 'friends' | 'private';
<<<<<<< HEAD
  title_alignment?: 'left' | 'center' | 'right';
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface Folder {
  id: number;
  user_id: number;
  name: string;
  parentId: number | null;
  created_at: Date;
  deleted_at?: Date;
}

export interface Note {
  id: number;
  user_id: number;
  folderId?: number;
  title: string;
  content: string;
  privacy: 'public' | 'friends' | 'private';
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface Notification {
  id: number;
  user_id: number;
  type: 'friend_request' | 'friend_request_accepted' | 'friend_request_rejected' | 'admin_post' | 'admin_announcement' | 'friend_post' | 'mention' | 'comment' | 'reaction' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: Date;
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
  updateUserAvatar(userId: number, avatarUrl: string, originalUrl?: string | null, cropJson?: string | null): Promise<void>;
  setUserRole(userId: number, role: "user" | "admin"): Promise<void>;
  loginWithCredentials(username: string, password: string): Promise<User | undefined>;
  createAdminUser(username: string, password: string, name: string, email: string): Promise<User>;
  registerUser(email: string, password: string, name: string, gmailAddress?: string, githubLink?: string, linkedinLink?: string): Promise<User>;

  // Post operations
<<<<<<< HEAD
  getPosts(userId?: number): Promise<(Post & { userName: string; userAvatar: string | null })[]>;
  getPostById(id: number): Promise<(Post & { userName: string }) | undefined>;
  createPost(userId: number, title: string, content: string, codeBlockTheme?: string, privacy?: 'public' | 'friends' | 'private', titleAlignment?: 'left' | 'center' | 'right'): Promise<Post>;
  updatePost(id: number, title: string, content: string, privacy?: 'public' | 'friends' | 'private', titleAlignment?: 'left' | 'center' | 'right'): Promise<Post>;
=======
  getPosts(userId?: number): Promise<(Post & { userName: string })[]>;
  getPostById(id: number): Promise<(Post & { userName: string }) | undefined>;
  createPost(userId: number, title: string, content: string, codeBlockTheme?: string, privacy?: 'public' | 'friends' | 'private'): Promise<Post>;
  updatePost(id: number, title: string, content: string): Promise<Post>;
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
  deletePost(id: number): Promise<void>;

  // Saved post operations
  savePost(userId: number, postId: number): Promise<SavedPost>;
  unsavePost(userId: number, postId: number): Promise<void>;
  getSavedPosts(userId: number): Promise<(Post & { userName: string; userAvatar: string | null; savedAt: Date })[]>;
  isPostSaved(userId: number, postId: number): Promise<boolean>;

  // Folder operations
  getFolders(userId: number): Promise<Folder[]>;
  getFolderById(id: number): Promise<Folder | undefined>;
  createFolder(userId: number, name: string, parentId?: number | null): Promise<Folder>;
  deleteFolder(id: number): Promise<void>;

  // Note operations
  getNotes(userId: number): Promise<(Note & { folderName?: string })[]>;
  getNoteById(id: number): Promise<(Note & { folderName?: string }) | undefined>;
  createNote(userId: number, title: string, content: string, folderId?: number, privacy?: 'public' | 'friends' | 'private'): Promise<Note>;
<<<<<<< HEAD
  updateNote(id: number, title?: string, content?: string, folderId?: number, privacy?: 'public' | 'friends' | 'private'): Promise<Note>;
=======
  updateNote(id: number, title?: string, content?: string, folderId?: number): Promise<Note>;
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
  deleteNote(id: number): Promise<void>;

  // Friend operations
  sendFriendRequest(userId: number, friendId: number): Promise<void>;
  acceptFriendRequest(userId: number, friendId: number): Promise<void>;
  rejectFriendRequest(userId: number, friendId: number): Promise<void>;
  removeFriend(userId: number, friendId: number): Promise<void>;
  getFriends(userId: number): Promise<User[]>;
  getFriendRequests(userId: number): Promise<User[]>;
<<<<<<< HEAD
  getFriendsPosts(userId: number): Promise<(Post & { userName: string; userAvatar: string | null })[]>;
=======
  getFriendsPosts(userId: number): Promise<(Post & { userName: string })[]>;
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
  getFriendsNotes(userId: number): Promise<(Note & { userName: string; folderName?: string })[]>;
  areFriends(userId: number, friendId: number): Promise<boolean>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: number, limit?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(notificationId: number): Promise<void>;

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
  // Bug report operations
  createBugReport(userId: number, type: "bug" | "feature_request", message: string): Promise<BugReport>;
  getBugReports(): Promise<(BugReport & { userName: string; userEmail: string })[]>;
  updateBugReport(id: number, updates: UpdateBugReportRequest): Promise<BugReport>;
  deleteBugReport(id: number): Promise<void>;

<<<<<<< HEAD
=======
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
  // Skills operations
  getUserSkills(userId: number): Promise<string[]>;
  updateUserSkills(userId: number, skillIds: string[]): Promise<void>;
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
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, role, created_at FROM users WHERE email = ? AND provider = ?",
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
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, role, created_at FROM users WHERE id = ?",
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
<<<<<<< HEAD
        "SELECT id, provider, name, email, password, designation, gmail_address, github_link, linkedin_link, avatar, avatar_original, avatar_crop, role, created_at FROM users WHERE email = ?",
=======
        "SELECT id, provider, name, email, password, designation, gmail_address, github_link, linkedin_link, role, created_at FROM users WHERE email = ?",
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, avatar, avatar_original, avatar_crop, role, created_at FROM users WHERE id = ?",
=======
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, role, created_at FROM users WHERE id = ?",
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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

  async updateUserAvatar(userId: number, avatarUrl: string, originalUrl?: string | null, cropJson?: string | null): Promise<void> {
    const conn = await pool.getConnection();
    try {
      const parts: string[] = [];
      const values: any[] = [];
      if (avatarUrl !== undefined) {
        parts.push('avatar = ?');
        values.push(avatarUrl);
      }
      if (originalUrl !== undefined) {
        parts.push('avatar_original = ?');
        values.push(originalUrl);
      }
      if (cropJson !== undefined) {
        parts.push('avatar_crop = ?');
        values.push(cropJson);
      }

      if (parts.length === 0) return;

      const sql = `UPDATE users SET ${parts.join(', ')} WHERE id = ?`;
      values.push(userId);
      await conn.execute(sql, values);
    } finally {
      conn.release();
    }
  }

  async loginWithCredentials(username: string, password: string): Promise<User | undefined> {
    const conn = await pool.getConnection();
    try {
<<<<<<< HEAD
      // First try username
      let [rows] = await conn.execute<any[]>(
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, role, created_at, password FROM users WHERE username = ?",
=======
      const [rows] = await conn.execute<any[]>(
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, role, created_at FROM users WHERE username = ?",
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
        [username]
      );
      
      // If not found by username, try email
      if (rows.length === 0) {
        [rows] = await conn.execute<any[]>(
          "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, role, created_at, password FROM users WHERE email = ?",
          [username]
        );
      }
      
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
<<<<<<< HEAD
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, avatar, role, created_at FROM users WHERE id = ?",
=======
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, role, created_at FROM users WHERE id = ?",
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, avatar, role, created_at FROM users WHERE id = ?",
=======
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, role, created_at FROM users WHERE id = ?",
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
        [result.insertId]
      );

      return newUser[0];
    } finally {
      conn.release();
    }
  }

  // Post operations
<<<<<<< HEAD
  async getPosts(userId?: number): Promise<(Post & { userName: string; userAvatar: string | null })[]> {
    const conn = await pool.getConnection();
    try {
      let query = `
        SELECT p.*, u.name as userName, u.avatar as userAvatar FROM posts p
=======
  async getPosts(userId?: number): Promise<(Post & { userName: string })[]> {
    const conn = await pool.getConnection();
    try {
      let query = `
        SELECT p.*, u.name as userName FROM posts p
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.deleted_at IS NULL
      `;
      const params: any[] = [];

      if (userId) {
        // Get user's friends
        const friends = await this.getFriends(userId);
        const friendIds = friends.map(f => f.id);

        query += ` AND (
          p.privacy = 'public' OR
          (p.privacy = 'friends' AND p.user_id IN (${friendIds.length > 0 ? friendIds.map(() => '?').join(',') : 'NULL'})) OR
          p.user_id = ?
        )`;
        params.push(...friendIds, userId);
      } else {
        query += ` AND p.privacy = 'public'`;
      }

      query += ` ORDER BY p.created_at DESC`;

      const [rows] = await conn.execute<any[]>(query, params);
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

<<<<<<< HEAD
  async createPost(userId: number, title: string, content: string, codeBlockTheme: string = 'dark', privacy: 'public' | 'friends' | 'private' = 'public', titleAlignment: 'left' | 'center' | 'right' = 'left'): Promise<Post> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute<any>(
        "INSERT INTO posts (user_id, title, content, code_block_theme, privacy, title_alignment) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, title, content, codeBlockTheme, privacy, titleAlignment]
=======
  async createPost(userId: number, title: string, content: string, codeBlockTheme: string = 'dark', privacy: 'public' | 'friends' | 'private' = 'public'): Promise<Post> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute<any>(
        "INSERT INTO posts (user_id, title, content, code_block_theme, privacy) VALUES (?, ?, ?, ?, ?)",
        [userId, title, content, codeBlockTheme, privacy]
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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

  async updatePost(id: number, title: string, content: string, privacy?: 'public' | 'friends' | 'private', titleAlignment?: 'left' | 'center' | 'right'): Promise<Post> {
    const conn = await pool.getConnection();
    try {
      if (privacy && titleAlignment) {
        await conn.execute(
          "UPDATE posts SET title = ?, content = ?, privacy = ?, title_alignment = ? WHERE id = ?",
          [title, content, privacy, titleAlignment, id]
        );
      } else if (privacy) {
        await conn.execute(
          "UPDATE posts SET title = ?, content = ?, privacy = ? WHERE id = ?",
          [title, content, privacy, id]
        );
      } else if (titleAlignment) {
        await conn.execute(
          "UPDATE posts SET title = ?, content = ?, title_alignment = ? WHERE id = ?",
          [title, content, titleAlignment, id]
        );
      } else {
        await conn.execute(
          "UPDATE posts SET title = ?, content = ? WHERE id = ?",
          [title, content, id]
        );
      }

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
      await conn.execute("UPDATE posts SET deleted_at = NOW() WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }

  // Saved post operations
  async savePost(userId: number, postId: number): Promise<SavedPost> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute<any>(
        "INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = NOW()",
        [userId, postId]
      );

      const [rows] = await conn.execute<any[]>(
        "SELECT id, user_id, post_id, created_at FROM saved_posts WHERE user_id = ? AND post_id = ?",
        [userId, postId]
      );

      return rows[0];
    } finally {
      conn.release();
    }
  }

  async unsavePost(userId: number, postId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?", [userId, postId]);
    } finally {
      conn.release();
    }
  }

  async getSavedPosts(userId: number): Promise<(Post & { userName: string; userAvatar: string | null; savedAt: Date })[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        `SELECT p.*, u.name as userName, u.avatar as userAvatar, sp.created_at as savedAt 
         FROM saved_posts sp
         JOIN posts p ON sp.post_id = p.id
         LEFT JOIN users u ON p.user_id = u.id
         WHERE sp.user_id = ? AND p.deleted_at IS NULL
         ORDER BY sp.created_at DESC`,
        [userId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  async isPostSaved(userId: number, postId: number): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT 1 FROM saved_posts WHERE user_id = ? AND post_id = ?",
        [userId, postId]
      );
      return rows.length > 0;
    } finally {
      conn.release();
    }
  }

  // Folder operations
  async getFolders(userId: number): Promise<Folder[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id, user_id, name, parent_id, created_at, deleted_at FROM folders WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
        [userId]
      );
      return (rows as any[]).map(row => ({
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        parentId: row.parent_id,
        created_at: row.created_at,
        deleted_at: row.deleted_at,
      }));
    } finally {
      conn.release();
    }
  }

  async getFolderById(id: number): Promise<Folder | undefined> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id, user_id, name, parent_id, created_at FROM folders WHERE id = ?",
        [id]
      );
      if ((rows as any[]).length === 0) return undefined;
      const row = (rows as any[])[0];
      return {
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        parentId: row.parent_id,
        created_at: row.created_at,
      };
    } finally {
      conn.release();
    }
  }

  async createFolder(userId: number, name: string, parentId?: number | null): Promise<Folder> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        "INSERT INTO folders (user_id, name, parent_id) VALUES (?, ?, ?)",
        [userId, name, parentId ?? null]
      );
      const folderId = (result as any).insertId;
      return {
        id: folderId,
        user_id: userId,
        name,
        parentId: parentId ?? null,
        created_at: new Date(),
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

  async updateFolderParent(id: number, parentId: number | null): Promise<Folder> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("UPDATE folders SET parent_id = ? WHERE id = ?", [parentId, id]);
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
      // First, recursively delete all subfolders
      const [subFolders] = await conn.execute(
        "SELECT id FROM folders WHERE parent_id = ? AND deleted_at IS NULL",
        [id]
      );
      for (const subFolder of (subFolders as any[])) {
        await this.deleteFolder(subFolder.id);
      }

      // Then delete all notes in this folder
      await conn.execute("UPDATE notes SET deleted_at = NOW() WHERE folder_id = ?", [id]);

      // Finally, delete the folder itself
      await conn.execute("UPDATE folders SET deleted_at = NOW() WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }

  // Note operations
  async getNotes(userId: number): Promise<(Note & { folderName?: string })[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT n.id, n.user_id, n.folder_id, n.title, n.content, n.privacy, n.created_at, n.updated_at, f.name as folder_name
         FROM notes n
         LEFT JOIN folders f ON n.folder_id = f.id
         WHERE n.user_id = ? AND n.deleted_at IS NULL AND (f.deleted_at IS NULL OR f.id IS NULL)
         ORDER BY n.updated_at DESC`,
        [userId]
      );
      return (rows as any[]).map(row => ({
        id: row.id,
        user_id: row.user_id,
        folderId: row.folder_id,
        title: row.title,
        content: row.content,
        privacy: row.privacy,
        created_at: row.created_at,
        updated_at: row.updated_at,
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
        `SELECT n.id, n.user_id, n.folder_id, n.title, n.content, n.privacy, n.created_at, n.updated_at, f.name as folder_name
         FROM notes n
         LEFT JOIN folders f ON n.folder_id = f.id
         WHERE n.id = ?`,
        [id]
      );
      if ((rows as any[]).length === 0) return undefined;
      const row = (rows as any[])[0];
      return {
        id: row.id,
        user_id: row.user_id,
        folderId: row.folder_id,
        title: row.title,
        content: row.content,
        privacy: row.privacy,
        created_at: row.created_at,
        updated_at: row.updated_at,
        folderName: row.folder_name,
      };
    } finally {
      conn.release();
    }
  }

  async createNote(userId: number, title: string, content: string, folderId?: number, privacy: 'public' | 'friends' | 'private' = 'private'): Promise<Note> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        "INSERT INTO notes (user_id, folder_id, title, content, privacy) VALUES (?, ?, ?, ?, ?)",
        [userId, folderId || null, title, content, privacy]
      );
      const noteId = (result as any).insertId;
      return {
        id: noteId,
        user_id: userId,
        folderId: folderId,
        title,
        content,
        privacy,
        created_at: new Date(),
        updated_at: new Date(),
      };
    } finally {
      conn.release();
    }
  }

  async updateNote(id: number, title?: string, content?: string, folderId?: number, privacy?: 'public' | 'friends' | 'private'): Promise<Note> {
    const conn = await pool.getConnection();
    try {
      // Build dynamic update query based on provided fields
      const updates: string[] = [];
      const values: any[] = [];

      if (title !== undefined) {
        updates.push("title = ?");
        values.push(title);
      }
      if (content !== undefined) {
        updates.push("content = ?");
        values.push(content);
      }
      if (folderId !== undefined) {
        updates.push("folder_id = ?");
        values.push(folderId);
      }
      if (privacy !== undefined) {
        updates.push("privacy = ?");
        values.push(privacy);
      }

      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      const query = `UPDATE notes SET ${updates.join(", ")} WHERE id = ?`;
      await conn.execute(query, values);

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
      await conn.execute("UPDATE notes SET deleted_at = NOW() WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }

  async getDeletedNotes(userId: number): Promise<Note[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT id, user_id, folder_id as folderId, title, content, privacy, created_at, updated_at, deleted_at
         FROM notes
         WHERE user_id = ? AND deleted_at IS NOT NULL
         ORDER BY deleted_at DESC`,
        [userId]
      );
      return (rows as any[]).map(row => ({
        id: row.id,
        user_id: row.user_id,
        folderId: row.folderId,
        title: row.title,
        content: row.content,
        privacy: row.privacy,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
      }));
    } finally {
      conn.release();
    }
  }

  async getDeletedFolders(userId: number): Promise<Folder[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id, user_id, name, parent_id, created_at, deleted_at FROM folders WHERE user_id = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC",
        [userId]
      );
      return (rows as any[]).map(row => ({
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        parentId: row.parent_id,
        created_at: row.created_at,
        deleted_at: row.deleted_at,
      }));
    } finally {
      conn.release();
    }
  }

  async restoreNote(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("UPDATE notes SET deleted_at = NULL WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }

  async restoreFolder(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("UPDATE folders SET deleted_at = NULL WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }

  async permanentDeleteNote(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("DELETE FROM notes WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }

  async permanentDeleteFolder(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("DELETE FROM folders WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }

  async getDeletedPosts(userId: number): Promise<Post[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT id, user_id, title, content, code_block_theme, privacy, created_at, updated_at, deleted_at
         FROM posts
         WHERE user_id = ? AND deleted_at IS NOT NULL
         ORDER BY deleted_at DESC`,
        [userId]
      );
      return (rows as any[]).map(row => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        content: row.content,
        code_block_theme: row.code_block_theme,
        privacy: row.privacy,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
      }));
    } finally {
      conn.release();
    }
  }

  async restorePost(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("UPDATE posts SET deleted_at = NULL WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }

  async permanentDeletePost(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute("DELETE FROM posts WHERE id = ?", [id]);
    } finally {
      conn.release();
    }
  }

  // Friend operations
  async sendFriendRequest(userId: number, friendId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      // Check if friendship already exists
      const [existing] = await conn.execute<any[]>(
        "SELECT id FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
        [userId, friendId, friendId, userId]
      );

      if (existing.length > 0) {
        throw new Error("Friendship already exists");
      }

      await conn.execute(
        "INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')",
        [userId, friendId]
      );
    } finally {
      conn.release();
    }
  }

  async acceptFriendRequest(userId: number, friendId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      // Update the existing pending request to accepted
      await conn.execute(
        "UPDATE friends SET status = 'accepted', updated_at = NOW() WHERE user_id = ? AND friend_id = ? AND status = 'pending'",
        [friendId, userId]
      );

      // Check if reverse relationship already exists, if not, create it
      const [existing] = await conn.execute<any[]>(
        "SELECT id FROM friends WHERE user_id = ? AND friend_id = ?",
        [userId, friendId]
      );

      if (existing.length === 0) {
        // Create the reverse relationship only if it doesn't exist
        await conn.execute(
          "INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')",
          [userId, friendId]
        );
      } else {
        // Update existing reverse relationship to accepted if it's not already
        await conn.execute(
          "UPDATE friends SET status = 'accepted', updated_at = NOW() WHERE user_id = ? AND friend_id = ? AND status != 'accepted'",
          [userId, friendId]
        );
      }
    } finally {
      conn.release();
    }
  }

  async rejectFriendRequest(userId: number, friendId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "DELETE FROM friends WHERE user_id = ? AND friend_id = ? AND status = 'pending'",
        [friendId, userId]
      );
    } finally {
      conn.release();
    }
  }

  async removeFriend(userId: number, friendId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
        [userId, friendId, friendId, userId]
      );
    } finally {
      conn.release();
    }
  }

  async getFriends(userId: number): Promise<User[]> {
    const conn = await pool.getConnection();
    try {
      // First, get all friend IDs (both directions)
      const [friendIds] = await conn.execute<any[]>(
        `SELECT DISTINCT
           CASE
             WHEN f.user_id = ? THEN f.friend_id
             WHEN f.friend_id = ? THEN f.user_id
           END as friend_id
         FROM friends f
         WHERE (f.user_id = ? OR f.friend_id = ?)
         AND f.status = 'accepted'`,
        [userId, userId, userId, userId]
      );

      if (friendIds.length === 0) {
        return [];
      }

      // Then get the user details for these friend IDs
      const friendIdList = friendIds.map(f => f.friend_id);
      const placeholders = friendIdList.map(() => '?').join(',');
      const [rows] = await conn.execute<any[]>(
        `SELECT id, name, email, provider, role, created_at, gmail_address, github_link, linkedin_link
         FROM users
         WHERE id IN (${placeholders})
         ORDER BY name`,
        friendIdList
      );

      return rows;
    } finally {
      conn.release();
    }
  }

  async getFriendRequests(userId: number): Promise<User[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        `SELECT u.id, u.name, u.email, u.provider, u.role, u.created_at, u.gmail_address, u.github_link, u.linkedin_link
         FROM users u
         INNER JOIN friends f ON f.user_id = u.id
         WHERE f.friend_id = ? AND f.status = 'pending'`,
        [userId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

<<<<<<< HEAD
  async getFriendsPosts(userId: number): Promise<(Post & { userName: string; userAvatar: string | null })[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        `SELECT p.*, u.name as userName, u.avatar as userAvatar, p.user_id FROM posts p
=======
  async getFriendsPosts(userId: number): Promise<(Post & { userName: string })[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        `SELECT p.*, u.name as userName, p.user_id FROM posts p
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
         INNER JOIN users u ON p.user_id = u.id
         INNER JOIN friends f ON (f.friend_id = p.user_id OR f.user_id = p.user_id)
         WHERE ((f.user_id = ? AND f.friend_id = p.user_id) OR (f.friend_id = ? AND f.user_id = p.user_id))
         AND f.status = 'accepted' AND p.privacy IN ('public', 'friends') AND p.deleted_at IS NULL AND p.user_id != ?
         ORDER BY p.created_at DESC`,
        [userId, userId, userId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  async getFriendsNotes(userId: number): Promise<(Note & { userName: string; folderName?: string })[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        `SELECT n.id, n.user_id, n.folder_id as folderId, n.title, n.content, n.privacy, n.created_at, n.updated_at, n.deleted_at,
                u.name as userName, f.name as folderName
         FROM notes n
         INNER JOIN users u ON n.user_id = u.id
         LEFT JOIN folders f ON n.folder_id = f.id
         INNER JOIN friends fr ON (fr.friend_id = n.user_id OR fr.user_id = n.user_id)
         WHERE ((fr.user_id = ? AND fr.friend_id = n.user_id) OR (fr.friend_id = ? AND fr.user_id = n.user_id))
         AND fr.status = 'accepted' AND n.privacy IN ('public', 'friends') AND n.deleted_at IS NULL AND n.user_id != ?
         ORDER BY n.updated_at DESC`,
        [userId, userId, userId]
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  async areFriends(userId: number, friendId: number): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT id FROM friends WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = 'accepted'",
        [userId, friendId, friendId, userId]
      );
      return rows.length > 0;
    } finally {
      conn.release();
    }
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute<any>(
        "INSERT INTO notifications (user_id, type, title, message, data, is_read) VALUES (?, ?, ?, ?, ?, ?)",
        [
          notification.user_id,
          notification.type,
          notification.title,
          notification.message,
          notification.data ? JSON.stringify(notification.data) : null,
          notification.is_read || false
        ]
      );
      
      const [rows] = await conn.execute<any[]>(
        "SELECT id, user_id, type, title, message, data, is_read, created_at FROM notifications WHERE id = ?",
        [result.insertId]
      );
      
      const row = rows[0];
      return {
        ...row,
        data: row.data ? JSON.parse(row.data) : undefined,
        created_at: new Date(row.created_at)
      };
    } finally {
      conn.release();
    }
  }

  async getNotifications(userId: number, limit: number = 50): Promise<Notification[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT id, user_id, type, title, message, data, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
        [userId, limit]
      );
      
      return rows.map(row => ({
        ...row,
        data: row.data ? JSON.parse(row.data) : undefined,
        created_at: new Date(row.created_at)
      }));
    } finally {
      conn.release();
    }
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false",
        [userId]
      );
      return rows[0].count;
    } finally {
      conn.release();
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "UPDATE notifications SET is_read = true WHERE id = ?",
        [notificationId]
      );
    } finally {
      conn.release();
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false",
        [userId]
      );
    } finally {
      conn.release();
    }
  }

  async deleteNotification(notificationId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "DELETE FROM notifications WHERE id = ?",
        [notificationId]
      );
    } finally {
      conn.release();
    }
  }
<<<<<<< HEAD

  // Bug report methods
  async createBugReport(userId: number, type: "bug" | "feature_request", message: string): Promise<BugReport> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute<any>(
        "INSERT INTO bug_reports (user_id, type, message) VALUES (?, ?, ?)",
        [userId, type, message]
      );

      const [rows] = await conn.execute<any[]>(
        "SELECT id, user_id, type, message, status, admin_response, created_at, updated_at FROM bug_reports WHERE id = ?",
        [result.insertId]
      );

      return rows[0];
    } finally {
      conn.release();
    }
  }

  async getBugReports(): Promise<(BugReport & { userName: string; userEmail: string })[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        `SELECT br.id, br.user_id, br.type, br.message, br.status, br.admin_response, br.created_at, br.updated_at,
                u.name as userName, u.email as userEmail
         FROM bug_reports br
         JOIN users u ON br.user_id = u.id
         ORDER BY br.created_at DESC`
      );

      return rows;
    } finally {
      conn.release();
    }
  }

  async updateBugReport(id: number, updates: UpdateBugReportRequest): Promise<BugReport> {
    const conn = await pool.getConnection();
    try {
      const setParts: string[] = [];
      const values: any[] = [];

      if (updates.status !== undefined) {
        setParts.push("status = ?");
        values.push(updates.status);
      }

      if (updates.admin_response !== undefined) {
        setParts.push("admin_response = ?");
        values.push(updates.admin_response);
      }

      if (setParts.length === 0) {
        throw new Error("No updates provided");
      }

      values.push(id);

      await conn.execute(
        `UPDATE bug_reports SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      const [rows] = await conn.execute<any[]>(
        "SELECT id, user_id, type, message, status, admin_response, created_at, updated_at FROM bug_reports WHERE id = ?",
        [id]
      );

      return rows[0];
    } finally {
      conn.release();
    }
  }

  async deleteBugReport(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "DELETE FROM bug_reports WHERE id = ?",
        [id]
      );
    } finally {
      conn.release();
    }
  }

  // Bug report methods
  async createBugReport(userId: number, type: "bug" | "feature_request", message: string): Promise<BugReport> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute<any>(
        "INSERT INTO bug_reports (user_id, type, message) VALUES (?, ?, ?)",
        [userId, type, message]
      );

      const [rows] = await conn.execute<any[]>(
        "SELECT id, user_id, type, message, status, admin_response, created_at, updated_at FROM bug_reports WHERE id = ?",
        [result.insertId]
      );

      return rows[0];
    } finally {
      conn.release();
    }
  }

  async getBugReports(): Promise<(BugReport & { userName: string; userEmail: string })[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        `SELECT br.id, br.user_id, br.type, br.message, br.status, br.admin_response, br.created_at, br.updated_at,
                u.name as userName, u.email as userEmail
         FROM bug_reports br
         JOIN users u ON br.user_id = u.id
         ORDER BY br.created_at DESC`
      );

      return rows.map(row => {
        let adminResponse = null;
        if (row.admin_response) {
          try {
            // Try to parse as JSON (new format)
            adminResponse = JSON.parse(row.admin_response);
            // If it's not an array, convert it to array format (migration for old data)
            if (!Array.isArray(adminResponse)) {
              adminResponse = [{ message: adminResponse, timestamp: row.updated_at || row.created_at }];
            }
          } catch (e) {
            // If parsing fails, treat as old string format and convert to array
            adminResponse = [{ message: row.admin_response, timestamp: row.updated_at || row.created_at }];
          }
        }
        return {
          ...row,
          admin_response: adminResponse
        };
      });
    } finally {
      conn.release();
    }
  }

  async updateBugReport(id: number, updates: UpdateBugReportRequest): Promise<BugReport> {
    const conn = await pool.getConnection();
    try {
      // First get the current bug report to handle admin_response appending
      const [currentRows] = await conn.execute<any[]>(
        "SELECT admin_response FROM bug_reports WHERE id = ?",
        [id]
      );

      if (currentRows.length === 0) {
        throw new Error("Bug report not found");
      }

      const currentAdminResponse = currentRows[0].admin_response;
      let adminResponses: any[] = [];

      // Parse existing admin responses or initialize empty array
      if (currentAdminResponse) {
        try {
          adminResponses = JSON.parse(currentAdminResponse);
        } catch (e) {
          // If parsing fails, treat as legacy string and convert to array
          adminResponses = [{ message: currentAdminResponse, timestamp: new Date() }];
        }
      }

      const setParts: string[] = [];
      const values: any[] = [];

      if (updates.status !== undefined) {
        setParts.push("status = ?");
        values.push(updates.status);
      }

      if (updates.admin_response !== undefined && updates.admin_response.trim() !== '') {
        // Append new response to the array
        adminResponses.push({
          message: updates.admin_response.trim(),
          timestamp: new Date()
        });

        setParts.push("admin_response = ?");
        values.push(JSON.stringify(adminResponses));
      }

      if (setParts.length === 0) {
        throw new Error("No updates provided");
      }

      values.push(id);

      await conn.execute(
        `UPDATE bug_reports SET ${setParts.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      const [rows] = await conn.execute<any[]>(
        "SELECT id, user_id, type, message, status, admin_response, created_at, updated_at FROM bug_reports WHERE id = ?",
        [id]
      );

      const result = rows[0];
      // Parse admin_response for the returned result with migration support
      if (result.admin_response) {
        try {
          result.admin_response = JSON.parse(result.admin_response);
          // If it's not an array, convert it to array format (migration for old data)
          if (!Array.isArray(result.admin_response)) {
            result.admin_response = [{ message: result.admin_response, timestamp: result.updated_at || result.created_at }];
          }
        } catch (e) {
          // If parsing fails, treat as old string format and convert to array
          result.admin_response = [{ message: result.admin_response, timestamp: result.updated_at || result.created_at }];
        }
      } else {
        result.admin_response = null;
      }

      return result;
    } finally {
      conn.release();
    }
  }

  async deleteBugReport(id: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "DELETE FROM bug_reports WHERE id = ?",
        [id]
      );
    } finally {
      conn.release();
    }
  }

  // Share methods
  async createShare(userId: number, share: InsertShare): Promise<Share> {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute<any>(
        "INSERT INTO shares (user_id, shared_with_user_id, item_type, item_id) VALUES (?, ?, ?, ?)",
        [userId, share.shared_with_user_id, share.item_type, share.item_id]
      );
      
      const [rows] = await conn.execute<any[]>(
        "SELECT id, user_id, shared_with_user_id, item_type, item_id, created_at FROM shares WHERE id = ?",
        [result.insertId]
      );
      
      const row = rows[0];
      return {
        ...row,
        created_at: new Date(row.created_at)
      };
    } finally {
      conn.release();
    }
  }

  async getShares(userId: number): Promise<Share[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT id, user_id, shared_with_user_id, item_type, item_id, created_at FROM shares WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
      );
      
      return rows.map(row => ({
        ...row,
        created_at: new Date(row.created_at)
      }));
    } finally {
      conn.release();
    }
  }

  async getSharedWithMe(userId: number): Promise<Share[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT id, user_id, shared_with_user_id, item_type, item_id, created_at FROM shares WHERE shared_with_user_id = ? ORDER BY created_at DESC",
        [userId]
      );
      
      return rows.map(row => ({
        ...row,
        created_at: new Date(row.created_at)
      }));
    } finally {
      conn.release();
    }
  }

  async deleteShare(shareId: number): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "DELETE FROM shares WHERE id = ?",
        [shareId]
      );
    } finally {
      conn.release();
    }
  }

  async searchUsersByEmail(email: string): Promise<User[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, avatar, avatar_original, avatar_crop, role, created_at FROM users WHERE email LIKE ? AND role = 'user' LIMIT 10",
        [`%${email}%`]
      );
      
      return rows.map(row => ({
        ...row,
        created_at: new Date(row.created_at)
      }));
    } finally {
      conn.release();
    }
  }

  // Skills operations
  async getUserSkills(userId: number): Promise<string[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<any[]>(
        "SELECT skill_id FROM user_skills WHERE user_id = ? ORDER BY created_at",
        [userId]
      );
      return rows.map(row => row.skill_id);
    } finally {
      conn.release();
    }
  }

  async updateUserSkills(userId: number, skillIds: string[]): Promise<void> {
    const conn = await pool.getConnection();
    try {
      // Delete existing skills
      await conn.execute(
        "DELETE FROM user_skills WHERE user_id = ?",
        [userId]
      );

      // Insert new skills
      if (skillIds.length > 0) {
        const values = skillIds.map(skillId => `(${userId}, '${skillId}')`).join(', ');
        await conn.execute(
          `INSERT INTO user_skills (user_id, skill_id) VALUES ${values}`
        );
      }
    } finally {
      conn.release();
    }
  }

  async getAllTranslations(): Promise<Translation[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT * FROM translations ORDER BY key_name, language"
      );
      return rows as Translation[];
    } finally {
      conn.release();
    }
  }

  async getTranslationsByLanguage(language: string): Promise<Record<string, string>> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT key_name, text_value FROM translations WHERE language = ?",
        [language]
      );
      const translations: Record<string, string> = {};
      for (const row of rows as any[]) {
        translations[row.key_name] = row.text_value;
      }
      return translations;
    } finally {
      conn.release();
    }
  }

  async updateTranslation(id: number, textValue: string): Promise<Translation | null> {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "UPDATE translations SET text_value = ?, updated_at = NOW() WHERE id = ?",
        [textValue, id]
      );

      const [rows] = await conn.execute(
        "SELECT * FROM translations WHERE id = ?",
        [id]
      );

      const resultRows = rows as any[];
      return resultRows.length > 0 ? (resultRows[0] as Translation) : null;
    } finally {
      conn.release();
    }
  }

  async createTranslation(keyName: string, language: string, textValue: string): Promise<Translation> {
    const conn = await pool.getConnection();
    try {
      // Prevent duplicates at DB layer by checking existing
      const [existingRows] = await conn.execute(
        "SELECT id FROM translations WHERE key_name = ? AND language = ?",
        [keyName, language]
      );
      if ((existingRows as any[]).length > 0) {
        throw new Error("duplicate");
      }

      const [result] = await conn.execute<any>(
        "INSERT INTO translations (key_name, language, text_value, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [keyName, language, textValue]
      );

      const insertId = result.insertId;
      const [rows] = await conn.execute(
        "SELECT * FROM translations WHERE id = ?",
        [insertId]
      );

      const resultRows = rows as any[];
      return resultRows[0] as Translation;
    } finally {
      conn.release();
    }
  }
}

export interface Translation {
  id: number;
  key_name: string;
  language: string;
  text_value: string;
  created_at: Date;
  updated_at: Date;
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
}

export const storage = new MySQLStorage();
export const DEFAULT_USER_ID = 1;
