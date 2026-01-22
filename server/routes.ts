import multer from "multer";
import path from "path";
import fs from "fs";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { api } from "../shared/routes.js";
import { storage } from "./storage.js";
import { pool } from "./db-mysql.js";
import { NotificationService } from "./notification-service.js";

const DEFAULT_USER_ID = 0;

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // User search API
  app.get("/api/users/search", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email parameter is required" });
      }

      const users = await storage.searchUsersByEmail(email);
      res.json(users);
    } catch (err) {
      console.error("Failed to search users:", err);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Tasks API - commented out
  // app.get(api.tasks.list.path, async (req, res) => {
  //   const tasks = await storage.getTasks();
  //   res.json(tasks);
  // });

  // app.get(api.tasks.get.path, async (req, res) => {
  //   const task = await storage.getTask(Number(req.params.id));
  //   if (!task) {
  //     return res.status(404).json({ message: 'Task not found' });
  //   }
  //   res.json(task);
  // });

  // app.post(api.tasks.create.path, async (req, res) => {
  //   try {
  //     const input = api.tasks.create.input.parse(req.body);
  //     const task = await storage.createTask(input);
  //     res.status(201).json(task);
  //   } catch (err) {
  //     if (err instanceof z.ZodError) {
  //       return res.status(400).json({
  //         message: err.errors[0].message,
  //         field: err.errors[0].path.join('.'),
  //       });
  //     }
  //     throw err;
  //   }
  // });

  // app.put(api.tasks.update.path, async (req, res) => {
  //   try {
  //     const input = api.tasks.update.input.parse(req.body);
  //     const task = await storage.updateTask(Number(req.params.id), input);
  //     if (!task) {
  //       return res.status(404).json({ message: 'Task not found' });
  //     }
  //     res.json(task);
  //   } catch (err) {
  //     if (err instanceof z.ZodError) {
  //       return res.status(400).json({
  //         message: err.errors[0].message,
  //         field: err.errors[0].path.join('.'),
  //       });
  //     }
  //     throw err;
  //   }
  // });

  // app.delete(api.tasks.delete.path, async (req, res) => {
  //   await storage.deleteTask(Number(req.params.id));
  //   res.status(204).send();
  // });

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

      // Try to find user by email first, then by username
      let user;
      const conn = await pool.getConnection();
      try {
        // First try email
        let [rows] = await conn.execute<any[]>(
          "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, role, created_at, password FROM users WHERE email = ?",
          [email]
        );
        
        if (rows.length === 0) {
          // If not found by email, try username
          [rows] = await conn.execute<any[]>(
            "SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, role, created_at, password FROM users WHERE username = ?",
            [email]
          );
        }
        
        user = rows[0];
      } finally {
        conn.release();
      }

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
      // Fetch fresh user data from database to include any new fields
      const [updatedRows] = await storage.db.execute(
        'SELECT id, provider, name, email, designation, gmail_address, github_link, linkedin_link, avatar, avatar_original, avatar_crop, role, created_at FROM users WHERE id = ?',
        [user.id]
      );

      if ((updatedRows as any[]).length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch user skills
      const skillIds = await storage.getUserSkills(user.id);
      // Get full skill objects from database
      let skills: any[] = [];
      if (skillIds.length > 0) {
        const placeholders = skillIds.map(() => '?').join(',');
        const [skillRows] = await pool.execute(`SELECT id, name, category, color, logo_url as logoUrl FROM skills WHERE id IN (${placeholders})`, skillIds);
        skills = skillRows as any[];
      }

      const freshUser = {
        id: (updatedRows as any[])[0].id,
        provider: (updatedRows as any[])[0].provider,
        name: (updatedRows as any[])[0].name,
        email: (updatedRows as any[])[0].email,
        designation: (updatedRows as any[])[0].designation,
        skills: skills,
        avatar: (updatedRows as any[])[0].avatar,
        avatar_original: (updatedRows as any[])[0].avatar_original,
        avatar_crop: (updatedRows as any[])[0].avatar_crop,
        gmailAddress: (updatedRows as any[])[0].gmail_address,
        githubLink: (updatedRows as any[])[0].github_link,
        linkedinLink: (updatedRows as any[])[0].linkedin_link,
        role: (updatedRows as any[])[0].role,
        created_at: (updatedRows as any[])[0].created_at,
      };

      // Update session with fresh data
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.session.user = freshUser;

      return res.json(freshUser);
    }

    // Not authenticated — return null so frontend can treat as guest
    res.json(null);
  });

  // Get available skills for selection
  app.get('/api/skills', async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT id, name, category, color, logo_url as logoUrl FROM skills ORDER BY category, name');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching skills:', err);
      res.status(500).json({ message: 'Failed to fetch skills' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user skills
      const skills = await storage.getUserSkills(userId);

      // Return public user info (exclude password and sensitive data)
      const publicUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        gmailAddress: user.gmail_address,
        githubLink: user.github_link,
        linkedinLink: user.linkedin_link,
        skills: skills,
        created_at: user.created_at,
      };

      res.json(publicUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
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
      const { name, designation, currentPassword, newPassword, gmailAddress, githubLink, linkedinLink } = req.body;

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required to change password' });
        }

        const [rows] = await storage.db.execute(
          'SELECT password FROM users WHERE id = ?',
          [user.id]
        );

        if ((rows as any[]).length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, (rows as any[])[0].password);
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
      if (designation !== undefined) {
        updateFields.push('designation = ?');
        updateValues.push(designation);
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
        'SELECT id, name, email, designation, gmail_address, github_link, linkedin_link, role FROM users WHERE id = ?',
        [user.id]
      );

      if ((updatedRows as any[]).length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = {
        id: (updatedRows as any[])[0].id,
        name: (updatedRows as any[])[0].name,
        email: (updatedRows as any[])[0].email,
        designation: (updatedRows as any[])[0].designation,
        gmailAddress: (updatedRows as any[])[0].gmail_address,
        githubLink: (updatedRows as any[])[0].github_link,
        linkedinLink: (updatedRows as any[])[0].linkedin_link,
        role: (updatedRows as any[])[0].role,
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

  app.put('/api/me/skills', async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const { skills } = req.body;

      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: 'Skills must be an array' });
      }

      // Validate skill IDs against available skills in database
      if (skills.length > 0) {
        const placeholders = skills.map(() => '?').join(',');
        const [skillRows] = await pool.execute(`SELECT id FROM skills WHERE id IN (${placeholders})`, skills);
        const validSkillIds = (skillRows as any[]).map(row => row.id);
        const validSkills = skills.filter(skillId => validSkillIds.includes(skillId));

        if (validSkills.length !== skills.length) {
          return res.status(400).json({ message: 'Invalid skill IDs provided' });
        }
      }

      // Update user skills
      await storage.updateUserSkills(user.id, validSkills);

      res.json({ message: 'Skills updated successfully' });
    } catch (err) {
      console.error('Skills update error:', err);
      res.status(500).json({ message: 'Failed to update skills' });
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

  // Admin skill logo upload endpoint
  app.post('/api/admin/skill-logo', upload.single('logo'), async (req, res) => {
    try {
      console.log('Skill logo upload request received');
      console.log('Body:', req.body);
      console.log('File:', req.file);

      // Check if user is logged in (temporarily allow regular users for testing)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const user = req.session?.user;
      if (!user) {
        console.log('User not logged in');
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { skillId } = req.body;
      if (!skillId) {
        return res.status(400).json({ message: 'Skill ID is required' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Check if skill exists in database
      const [skillRows] = await pool.execute('SELECT id FROM skills WHERE id = ?', [skillId]);
      if (skillRows.length === 0) {
        return res.status(404).json({ message: 'Skill not found' });
      }

      // Generate unique filename
      const ext = path.extname(req.file.originalname);
      const filename = `${skillId}-logo-${Date.now()}${ext}`;
      const filepath = path.join('uploads', filename);

      // Move file from temp location to final location
      fs.renameSync(req.file.path, filepath);

      // Update the skill's logoUrl in database
      await pool.execute('UPDATE skills SET logo_url = ? WHERE id = ?', [`/uploads/${filename}`, skillId]);

      res.json({ 
        message: 'Logo uploaded successfully',
        skillId,
        logoUrl: `/uploads/${filename}`
      });
    } catch (err) {
      console.error('Skill logo upload error:', err);
      res.status(500).json({ message: 'Failed to upload logo' });
    }
  });

  // User avatar upload endpoint
  app.post('/api/me/avatar', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'original', maxCount: 1 }]), async (req, res) => {
    try {
      // @ts-ignore
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (!files || (!files['avatar'] && !files['original'])) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Check file sizes and compress if too large
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (files['avatar'] && files['avatar'][0] && files['avatar'][0].size > MAX_SIZE) {
        return res.status(400).json({ message: 'Avatar image file too large. Please use a smaller image.' });
      }
      // Allow larger original files since they're optional

      // Save original if present
      let originalUrl: string | null = null;
      if (files['original'] && files['original'][0]) {
        const orig = files['original'][0];
        const origExt = path.extname(orig.originalname) || '.png';
        const origFilename = `avatar-original-${user.id}-${Date.now()}${origExt}`;
        const origPath = path.join('uploads', origFilename);
        fs.renameSync(orig.path, origPath);
        originalUrl = `/uploads/${origFilename}`;
      }

      // Save display avatar (cropped)
      let avatarUrl: string | null = null;
      if (files['avatar'] && files['avatar'][0]) {
        const av = files['avatar'][0];
        const avExt = path.extname(av.originalname) || '.jpg';
        const avFilename = `avatar-${user.id}-${Date.now()}${avExt}`;
        const avPath = path.join('uploads', avFilename);
        fs.renameSync(av.path, avPath);
        avatarUrl = `/uploads/${avFilename}`;
      }

      // Crop metadata (optional)
      const cropJson = typeof req.body.crop === 'string' ? req.body.crop : JSON.stringify(req.body.crop || null);

      // Persist to DB (update avatar and original as available)
      await storage.updateUserAvatar(user.id, avatarUrl || originalUrl || '', originalUrl, cropJson);

      // Update session user
      // @ts-ignore
      req.session.user = { ...(req.session.user || {}), avatar: avatarUrl || originalUrl, avatar_original: originalUrl, avatar_crop: cropJson };

      res.json({ message: 'Avatar uploaded', avatarUrl: avatarUrl || originalUrl, avatarOriginal: originalUrl, crop: cropJson });
    } catch (err) {
      console.error('Avatar upload error:', err);
      res.status(500).json({ message: 'Failed to upload avatar' });
    }
  });

  // Posts API
  app.get('/api/posts', async (req, res) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const userId = req.session?.user?.id;
      const posts = await storage.getPosts(userId);
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

      const { title, content, codeBlockTheme, privacy } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const post = await storage.createPost(userId, title, content, codeBlockTheme || 'dark', privacy || 'public');

      // Create notifications for friends if post is public or friends-only
      if (privacy === 'public' || privacy === 'friends') {
        try {
          const author = await storage.getUserById(userId);
          if (author) {
            const friendIds = await NotificationService.getFriendIds(userId);
            if (friendIds.length > 0) {
              await NotificationService.createFriendPostNotification(friendIds, author.name, title);
            }
          }
        } catch (notificationErr) {
          console.error('Failed to create friend post notifications:', notificationErr);
          // Don't fail the post creation if notifications fail
        }
      }

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

      const { title, content, privacy, titleAlignment } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const updatedPost = await storage.updatePost(postId, title, content, privacy, titleAlignment);
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

      const { name, parentId } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const folder = await storage.createFolder(userId, name, parentId);
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

  app.put('/api/folders/:id', async (req, res) => {
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

      const { name, parentId } = req.body;

      // If parentId is provided, update parent relationship
      if (parentId !== undefined) {
        const updated = await storage.updateFolderParent(folderId, parentId);
        return res.json(updated);
      }

      // Otherwise, update name
      if (!name) return res.status(400).json({ message: 'Name is required' });
      const updated = await storage.updateFolder(folderId, name);
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update folder' });
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

      const { title, content, folderId, privacy } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const note = await storage.createNote(userId, title, content, folderId, privacy || 'public');
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

      const { title, content, folderId, privacy } = req.body;
      // For updates, title and content are optional, but at least one field should be provided
      if (title === undefined && content === undefined && folderId === undefined && privacy === undefined) {
        return res.status(400).json({ message: 'At least one field must be provided for update' });
      }

      const updatedNote = await storage.updateNote(noteId, title, content, folderId, privacy);
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

  // Folders API
  app.get("/api/folders", async (req, res) => {
    const userId = (req as any).session?.userId || DEFAULT_USER_ID;
    const folders = await storage.getFolders(userId);
    res.json(folders);
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const userId = (req as any).session?.userId || DEFAULT_USER_ID;
      const input = api.folders.create.input.parse(req.body);
      const folder = await storage.createFolder(userId, input.name);
      res.status(201).json(folder);
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

  app.put("/api/folders/:id", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'Name is required' });
      }
      const folder = await storage.updateFolder(Number(req.params.id), name);
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
      res.json(folder);
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

  app.delete("/api/folders/:id", async (req, res) => {
    const folder = await storage.getFolderById(Number(req.params.id));
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    await storage.deleteFolder(Number(req.params.id));
    res.status(204).send();
  });

  // Notes API
  app.get("/api/notes", async (req, res) => {
    const userId = (req as any).session?.userId || DEFAULT_USER_ID;
    const notes = await storage.getNotes(userId);
    res.json(notes);
  });

  app.get("/api/notes/:id", async (req, res) => {
    const note = await storage.getNoteById(Number(req.params.id));
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const userId = (req as any).session?.userId || DEFAULT_USER_ID;
      const input = api.notes.create.input.parse(req.body);
      const note = await storage.createNote(userId, input.title, input.content, input.folderId);
      res.status(201).json(note);
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

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const input = api.notes.update.input.parse(req.body);
      const note = await storage.updateNote(Number(req.params.id), input.title, input.content, input.folderId);
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      res.json(note);
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

  app.delete("/api/notes/:id", async (req, res) => {
    const note = await storage.getNoteById(Number(req.params.id));
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    await storage.deleteNote(Number(req.params.id));
    res.status(204).send();
  });

  // Trash API
  app.get("/api/trash/notes", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const notes = await storage.getDeletedNotes(userId);
    res.json(notes);
  });

  app.get("/api/trash/folders", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const folders = await storage.getDeletedFolders(userId);
    res.json(folders);
  });

  app.post("/api/trash/notes/:id/restore", async (req, res) => {
    await storage.restoreNote(Number(req.params.id));
    res.status(204).send();
  });

  app.post("/api/trash/folders/:id/restore", async (req, res) => {
    await storage.restoreFolder(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/trash/posts", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const posts = await storage.getDeletedPosts(userId);
    res.json(posts);
  });

  app.post("/api/trash/posts/:id/restore", async (req, res) => {
    await storage.restorePost(Number(req.params.id));
    res.status(204).send();
  });

  app.delete("/api/trash/posts/:id", async (req, res) => {
    await storage.permanentDeletePost(Number(req.params.id));
    res.status(204).send();
  });

  app.delete("/api/trash/notes/:id", async (req, res) => {
    await storage.permanentDeleteNote(Number(req.params.id));
    res.status(204).send();
  });

  app.delete("/api/trash/folders/:id", async (req, res) => {
    await storage.permanentDeleteFolder(Number(req.params.id));
    res.status(204).send();
  });

  // Friend routes
  app.post("/api/friends/request", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { friendId } = req.body;
    if (!friendId || friendId === userId) {
      return res.status(400).json({ message: 'Invalid friend ID' });
    }

    try {
      await storage.sendFriendRequest(userId, friendId);
      
      // Create notification for the recipient
      const sender = await storage.getUserById(userId);
      if (sender) {
        await NotificationService.createFriendRequestNotification(friendId, userId, sender.name);
      }
      
      res.status(201).json({ message: 'Friend request sent' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/friends/accept", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { friendId } = req.body;
    try {
      await storage.acceptFriendRequest(userId, friendId);
      
      // Create notification for the requester
      const accepter = await storage.getUserById(userId);
      if (accepter) {
        await NotificationService.createFriendRequestAcceptedNotification(friendId, accepter.name);
      }
      
      res.json({ message: 'Friend request accepted' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to accept friend request' });
    }
  });

  app.post("/api/friends/reject", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { friendId } = req.body;
    try {
      await storage.rejectFriendRequest(userId, friendId);
      
      // Create notification for the requester
      const rejecter = await storage.getUserById(userId);
      if (rejecter) {
        await NotificationService.createFriendRequestRejectedNotification(friendId, rejecter.name);
      }
      
      res.json({ message: 'Friend request rejected' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to reject friend request' });
    }
  });

  app.delete("/api/friends/:friendId", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const friendId = Number(req.params.friendId);
    try {
      await storage.removeFriend(userId, friendId);
      res.json({ message: 'Friend removed' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to remove friend' });
    }
  });

  app.get("/api/friends", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get friends' });
    }
  });

  app.get("/api/friends/requests", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const requests = await storage.getFriendRequests(userId);
      res.json(requests);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get friend requests' });
    }
  });

  app.get("/api/friends/posts", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const posts = await storage.getFriendsPosts(userId);
      res.json(posts);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get friends posts' });
    }
  });

  app.get("/api/friends/notes", async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const notes = await storage.getFriendsNotes(userId);
      res.json(notes);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get friends notes' });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getNotifications(userId, limit);
      res.json(notifications);
    } catch (err) {
      console.error("Failed to get notifications:", err);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (err) {
      console.error("Failed to get unread count:", err);
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const notificationId = parseInt(req.params.id);
      await storage.deleteNotification(notificationId);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete notification:", err);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Shares API
  app.get("/api/shares", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const shares = await storage.getShares(userId);
      // Enrich shares with recipient user info and item details
      const enriched = await Promise.all(shares.map(async (s) => {
        const otherUser = await storage.getUserById(s.shared_with_user_id);
        let item: any = null;
        if (s.item_type === 'folder') {
          item = await storage.getFolderById(s.item_id);
        } else {
          item = await storage.getNoteById(s.item_id);
        }
        return {
          ...s,
          shared_with_user: otherUser ? { id: otherUser.id, name: otherUser.name, email: otherUser.email } : null,
          item: item ? (s.item_type === 'folder' ? { id: item.id, name: item.name } : { id: item.id, title: item.title }) : null
        };
      }));
      res.json(enriched);
    } catch (err) {
      console.error("Failed to get shares:", err);
      res.status(500).json({ message: "Failed to get shares" });
    }
  });

  app.get("/api/shares/shared-with-me", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const shares = await storage.getSharedWithMe(userId);
      // Enrich with owner info and item details
      const enriched = await Promise.all(shares.map(async (s) => {
        const owner = await storage.getUserById(s.user_id);
        let item: any = null;
        if (s.item_type === 'folder') {
          item = await storage.getFolderById(s.item_id);
        } else {
          item = await storage.getNoteById(s.item_id);
        }
        return {
          ...s,
          owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : null,
          item: item ? (s.item_type === 'folder' ? { id: item.id, name: item.name } : { id: item.id, title: item.title }) : null
        };
      }));
      res.json(enriched);
    } catch (err) {
      console.error("Failed to get shared items:", err);
      res.status(500).json({ message: "Failed to get shared items" });
    }
  });

  app.post("/api/shares", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const input = api.shares.create.input.parse(req.body);
      
      // Verify the user owns the item they're trying to share
      if (input.item_type === 'folder') {
        const folder = await storage.getFolderById(input.item_id);
        if (!folder || folder.user_id !== userId) {
          return res.status(403).json({ message: "You can only share items you own" });
        }
      } else if (input.item_type === 'note') {
        const note = await storage.getNoteById(input.item_id);
        if (!note || note.user_id !== userId) {
          return res.status(403).json({ message: "You can only share items you own" });
        }
      }

      // Check if share already exists
      const existingShares = await storage.getShares(userId);
      const alreadyShared = existingShares.some(share => 
        share.shared_with_user_id === input.shared_with_user_id && 
        share.item_type === input.item_type && 
        share.item_id === input.item_id
      );

      if (alreadyShared) {
        return res.status(400).json({ message: "This item is already shared with this user" });
      }

      const share = await storage.createShare(userId, input);
      res.status(201).json(share);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Failed to create share:", err);
      res.status(500).json({ message: "Failed to create share" });
    }
  });

  app.delete("/api/shares/:id", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const shareId = parseInt(req.params.id);
      
      // Verify the user owns the share
      const shares = await storage.getShares(userId);
      const share = shares.find(s => s.id === shareId);
      
      if (!share) {
        return res.status(404).json({ message: "Share not found" });
      }

      await storage.deleteShare(shareId);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete share:", err);
      res.status(500).json({ message: "Failed to delete share" });
    }
  });

  // Saved Posts API
  app.get("/api/saved-posts", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const savedPosts = await storage.getSavedPosts(userId);
      res.json(savedPosts);
    } catch (err) {
      console.error("Failed to get saved posts:", err);
      res.status(500).json({ message: "Failed to get saved posts" });
    }
  });

  app.post("/api/saved-posts", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { post_id } = req.body;
      if (!post_id || typeof post_id !== 'number') {
        return res.status(400).json({ message: "post_id is required and must be a number" });
      }

      // Verify the post exists
      const post = await storage.getPostById(post_id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const savedPost = await storage.savePost(userId, post_id);
      res.status(201).json(savedPost);
    } catch (err) {
      console.error("Failed to save post:", err);
      res.status(500).json({ message: "Failed to save post" });
    }
  });

  app.delete("/api/saved-posts/:postId", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const postId = parseInt(req.params.postId);
      await storage.unsavePost(userId, postId);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to unsave post:", err);
      res.status(500).json({ message: "Failed to unsave post" });
    }
  });

  app.get("/api/saved-posts/check/:postId", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const postId = parseInt(req.params.postId);
      const saved = await storage.isPostSaved(userId, postId);
      res.json({ saved });
    } catch (err) {
      console.error("Failed to check if post is saved:", err);
      res.status(500).json({ message: "Failed to check saved status" });
    }
  });
  app.post("/api/notifications/test", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Create some test notifications
      await storage.createNotification({
        user_id: userId,
        type: "system",
        title: "Welcome to TaskFlow!",
        message: "Thanks for joining our community. Explore features and connect with others!",
        is_read: false
      });

      await storage.createNotification({
        user_id: userId,
        type: "friend_request",
        title: "Test Friend Request",
        message: "John Doe sent you a friend request (test notification)",
        is_read: false
      });

      await storage.createNotification({
        user_id: userId,
        type: "admin_announcement",
        title: "New Feature Available",
        message: "Check out our new notification system!",
        is_read: false
      });

      res.json({ success: true, message: "Test notifications created" });
    } catch (err) {
      console.error("Failed to create test notifications:", err);
      res.status(500).json({ message: "Failed to create test notifications" });
    }
  });

  // Bug Report API
  app.post("/api/bug-reports", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { type, message } = req.body;
      if (!type || !message) {
        return res.status(400).json({ message: "Type and message are required" });
      }

      if (!["bug", "feature_request"].includes(type)) {
        return res.status(400).json({ message: "Invalid type" });
      }

      const bugReport = await storage.createBugReport(userId, type, message);
      res.json(bugReport);
    } catch (err) {
      console.error("Failed to create bug report:", err);
      res.status(500).json({ message: "Failed to create bug report" });
    }
  });

  app.get("/api/admin/bug-reports", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const bugReports = await storage.getBugReports();
      res.json(bugReports);
    } catch (err) {
      console.error("Failed to fetch bug reports:", err);
      res.status(500).json({ message: "Failed to fetch bug reports" });
    }
  });

  app.put("/api/admin/bug-reports/:id", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const reportId = parseInt(req.params.id);
      const { status, admin_response } = req.body;

      const updates: any = {};
      if (status !== undefined) updates.status = status;
      if (admin_response !== undefined) updates.admin_response = admin_response;

      const updatedReport = await storage.updateBugReport(reportId, updates);

      // If admin_response is provided, send notification to user
      if (admin_response) {
        const report = await storage.getBugReports().then(reports => reports.find(r => r.id === reportId));
        if (report) {
          await storage.createNotification({
            user_id: report.user_id,
            type: "system",
            title: `Bug Report Update: ${report.type === 'bug' ? 'Bug' : 'Feature Request'}`,
            message: `Your ${report.type === 'bug' ? 'bug report' : 'feature request'} has been updated: ${admin_response}`,
            data: { bugReportId: reportId }
          });
        }
      }

      res.json(updatedReport);
    } catch (err) {
      console.error("Failed to update bug report:", err);
      res.status(500).json({ message: "Failed to update bug report" });
    }
  });

  app.delete("/api/admin/bug-reports/:id", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const reportId = parseInt(req.params.id);
      await storage.deleteBugReport(reportId);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to delete bug report:", err);
      res.status(500).json({ message: "Failed to delete bug report" });
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

  // Translation Management API (Admin only)
  app.get('/api/admin/translations', async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await storage.getUserById(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const translations = await storage.getAllTranslations();
      res.json(translations);
    } catch (err) {
      console.error('Failed to fetch translations:', err);
      res.status(500).json({ message: 'Failed to fetch translations' });
    }
  });

  app.put('/api/admin/translations/:id', async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await storage.getUserById(userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { text_value } = req.body;
      if (!text_value || typeof text_value !== 'string') {
        return res.status(400).json({ message: 'Text value is required' });
      }

      const translationId = Number(req.params.id);
      const updatedTranslation = await storage.updateTranslation(translationId, text_value);
      if (!updatedTranslation) {
        return res.status(404).json({ message: 'Translation not found' });
      }

      res.json(updatedTranslation);
    } catch (err) {
      console.error('Failed to update translation:', err);
      res.status(500).json({ message: 'Failed to update translation' });
    }
  });

  app.get('/api/translations/:language', async (req, res) => {
    try {
      const language = req.params.language;
      if (!language || !['en', 'bn'].includes(language)) {
        return res.status(400).json({ message: 'Invalid language' });
      }

      const translations = await storage.getTranslationsByLanguage(language);
      res.json(translations);
    } catch (err) {
      console.error('Failed to fetch translations:', err);
      res.status(500).json({ message: 'Failed to fetch translations' });
    }
  });

  return httpServer;
}
