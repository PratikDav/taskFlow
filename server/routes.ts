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
    console.log("GET /api/me - sessionID:", req.sessionID, "user:", user?.email || "null");
    if (user) {
      return res.json(user);
    }

    // Not authenticated — return null so frontend can treat as guest
    res.json(null);
  });

  app.put('/api/me', async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = req.session?.user;
    console.log("PUT /api/me called, user:", user?.email, "body:", req.body);
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const { name, currentPassword, newPassword, gmailAddress, githubLink, linkedinLink } = req.body;

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required to change password' });
        }

        const [rows] = await storage.db.execute(
          'SELECT password FROM users WHERE id = ?',
          [user.id]
        );

        if (rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isValidPassword) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await storage.db.execute(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id]
        );
      }

      // Update other fields
      const updateFields = [];
      const updateValues = [];

      if (name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      if (gmailAddress !== undefined) {
        updateFields.push('gmail_address = ?');
        updateValues.push(gmailAddress);
      }
      if (githubLink !== undefined) {
        updateFields.push('github_link = ?');
        updateValues.push(githubLink);
      }
      if (linkedinLink !== undefined) {
        updateFields.push('linkedin_link = ?');
        updateValues.push(linkedinLink);
      }

      if (updateFields.length > 0) {
        updateValues.push(user.id);
        console.log("Updating fields:", updateFields, "values:", updateValues);
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        console.log("Query:", query);
        try {
          await storage.db.execute(query, updateValues);
          console.log("Database update completed successfully");
        } catch (dbErr) {
          console.error("Database update error:", dbErr);
          return res.status(500).json({ message: 'Database update failed' });
        }
      }

      // Fetch updated user data
      const [updatedRows] = await storage.db.execute(
        'SELECT id, name, email, gmail_address, github_link, linkedin_link, role FROM users WHERE id = ?',
        [user.id]
      );

      if (updatedRows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = {
        id: updatedRows[0].id,
        name: updatedRows[0].name,
        email: updatedRows[0].email,
        gmailAddress: updatedRows[0].gmail_address,
        githubLink: updatedRows[0].github_link,
        linkedinLink: updatedRows[0].linkedin_link,
        role: updatedRows[0].role,
      };

      // Update session
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.session.user = updatedUser;

      res.json(updatedUser);
    } catch (err) {
      console.error('Profile update error:', err);
      res.status(500).json({ message: 'Failed to update profile' });
    }
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

      const { title, content, codeBlockTheme } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const post = await storage.createPost(userId, title, content, codeBlockTheme || 'dark');
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

  // Folders API
  app.get('/api/folders', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const folders = await storage.getFolders(userId);
      res.json(folders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch folders' });
    }
  });

  app.post('/api/folders', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const folder = await storage.createFolder(userId, name);
      res.status(201).json(folder);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create folder' });
    }
  });

  app.delete('/api/folders/:id', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const folderId = Number(req.params.id);
      const folder = await storage.getFolderById(folderId);
      
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }

      if (folder.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await storage.deleteFolder(folderId);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete folder' });
    }
  });

  // Notes API
  app.get('/api/notes', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notes = await storage.getNotes(userId);
      res.json(notes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch notes' });
    }
  });

  app.get('/api/notes/:id', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const noteId = Number(req.params.id);
      const note = await storage.getNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }

      if (note.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      res.json(note);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch note' });
    }
  });

  app.post('/api/notes', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { title, content, folderId } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const note = await storage.createNote(userId, title, content, folderId);
      res.status(201).json(note);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create note' });
    }
  });

  app.put('/api/notes/:id', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const noteId = Number(req.params.id);
      const note = await storage.getNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }

      if (note.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { title, content, folderId } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const updatedNote = await storage.updateNote(noteId, title, content, folderId);
      res.json(updatedNote);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update note' });
    }
  });

  app.delete('/api/notes/:id', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const noteId = Number(req.params.id);
      const note = await storage.getNoteById(noteId);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }

      if (note.user_id !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await storage.deleteNote(noteId);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete note' });
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
