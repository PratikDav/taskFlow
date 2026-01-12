import type { Express } from "express";
import type { Server } from "http";
import { storage, DEFAULT_USER_ID } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Tasks API
  app.get(api.tasks.list.path, async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.get(api.tasks.get.path, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  // User registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, gmailAddress, githubLink, linkedinLink } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ message: 'Email, password, and name are required' });
      }

      // Validate password strength (minimum 6 characters)
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }

      const user = await storage.registerUser(email, password, name, gmailAddress, githubLink, linkedinLink);

      // Store in session
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.session.user = user;

      // Explicitly save the session
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: 'Registration failed' });
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        res.status(201).json({ user: req.session.user });
      });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ message: err.message || 'Registration failed' });
    }
  });

  // User login with email/password endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await storage.findUserByEmail(email);

      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Store in session
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.session.user = user;
      console.log("DEBUG login - Setting session for user:", user.email, "Session ID:", req.sessionID);

      // Explicitly save the session
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: 'Login failed' });
        }
        console.log("DEBUG login - Session saved successfully");
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        res.json({ user: req.session.user });
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/me', async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = req.session?.user;
    // Detailed debug to inspect cookie and session ids
    console.log(
      "DEBUG /api/me - headers.cookie:",
      req.headers.cookie,
      "sessionID:",
      req.sessionID,
      "sessionObj:",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.session,
      "user:",
      user?.email || "none"
    );

    if (user) {
      return res.json(user);
    }

    // Not authenticated — return null so frontend can treat as guest
    res.json(null);
  });

  app.post('/api/logout', async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (req.session && typeof req.session.destroy === 'function') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.session.destroy(() => res.status(204).send());
    } else {
      res.status(204).send();
    }
  });

  // Admin credential login endpoint
  app.post('/api/auth/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const user = await storage.loginWithCredentials(username, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.session.user = user;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.json({ user: req.session.user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Create admin user endpoint (for setup)
  app.post('/api/auth/admin/create', async (req, res) => {
    try {
      const { username, password, name, email } = req.body;
      if (!username || !password || !name || !email) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const user = await storage.createAdminUser(username, password, name, email);
      
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.session.user = user;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      res.status(201).json({ user: req.session.user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create admin' });
    }
  });

  // Posts API
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  });

  app.post('/api/posts', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id || DEFAULT_USER_ID;

      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const post = await storage.createPost(userId, title, content);
      res.status(201).json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create post' });
    }
  });

  app.put('/api/posts/:id', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const postId = Number(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const updatedPost = await storage.updatePost(postId, title, content);
      res.json(updatedPost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update post' });
    }
  });

  app.delete('/api/posts/:id', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const postId = Number(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await storage.deletePost(postId);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete post' });
    }
  });

  // Seed data
  const existingTasks = await storage.getTasks();
  if (existingTasks.length === 0) {
    await storage.createTask({
      title: "Review project proposal",
      status: "todo",
      priority: "high",
      isFavorite: true
    });
    await storage.createTask({
      title: "Update documentation",
      status: "in_progress",
      priority: "medium",
      isFavorite: false
    });
    await storage.createTask({
      title: "Team sync meeting",
      status: "done",
      priority: "low",
      isFavorite: false
    });
    await storage.createTask({
      title: "Deploy to production",
      status: "todo",
      priority: "high",
      isFavorite: true
    });
  }

  return httpServer;
}
