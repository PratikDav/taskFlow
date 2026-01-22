import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import { SERVER_SKILLS } from "./skills.js";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "taskflow",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initDatabase() {
  const conn = await pool.getConnection();
  try {
    // Create users table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider VARCHAR(50),
        provider_id VARCHAR(255),
        username VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        gmail_address VARCHAR(255),
        github_link VARCHAR(255),
        linkedin_link VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_provider_id (provider, provider_id)
      )
    `);

    // Add password column if it doesn't exist
    try {
      await conn.execute(`
        ALTER TABLE users ADD COLUMN password VARCHAR(255)
      `);
      console.log("Password column added to users table");
    } catch (err: any) {
      // Column might already exist, which is fine
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add gmail_address column if it doesn't exist
    try {
      await conn.execute(`
        ALTER TABLE users ADD COLUMN gmail_address VARCHAR(255)
      `);
      console.log("gmail_address column added to users table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add github_link column if it doesn't exist
    try {
      await conn.execute(`
        ALTER TABLE users ADD COLUMN github_link VARCHAR(255)
      `);
      console.log("github_link column added to users table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add linkedin_link column if it doesn't exist
    try {
      await conn.execute(`
        ALTER TABLE users ADD COLUMN linkedin_link VARCHAR(255)
      `);
      console.log("linkedin_link column added to users table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add designation column if it doesn't exist
    try {
      await conn.execute(`
        ALTER TABLE users ADD COLUMN designation VARCHAR(255)
      `);
      console.log("designation column added to users table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

<<<<<<< HEAD
    // Add avatar column if it doesn't exist
    try {
      await conn.execute(`
        ALTER TABLE users ADD COLUMN avatar VARCHAR(255)
      `);
      console.log("avatar column added to users table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add avatar_original column if it doesn't exist
    try {
      await conn.execute(`
        ALTER TABLE users ADD COLUMN avatar_original VARCHAR(255)
      `);
      console.log("avatar_original column added to users table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add avatar_crop column (JSON) if it doesn't exist
    try {
      await conn.execute(`
        ALTER TABLE users ADD COLUMN avatar_crop TEXT
      `);
      console.log("avatar_crop column added to users table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Create skills table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS skills (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        color VARCHAR(20) NOT NULL,
        logo_url VARCHAR(255)
      )
    `);

    // Populate skills table with initial data
    for (const skill of SERVER_SKILLS) {
      await conn.execute(`
        INSERT IGNORE INTO skills (id, name, category, color, logo_url)
        VALUES (?, ?, ?, ?, ?)
      `, [skill.id, skill.name, skill.category, skill.color, skill.logoUrl || null]);
    }

=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
    // Create user_skills table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        skill_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
<<<<<<< HEAD
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
        UNIQUE KEY unique_user_skill (user_id, skill_id)
      )
    `);

    // Create folders table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS folders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create tasks table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create notes table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        folder_id INT,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
      )
    `);

    // Add deleted_at to folders table
    try {
      await conn.execute(`
        ALTER TABLE folders ADD COLUMN deleted_at TIMESTAMP NULL
      `);
      console.log("deleted_at column added to folders table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add parent_id to folders table
    try {
      await conn.execute(`
        ALTER TABLE folders ADD COLUMN parent_id INT NULL,
        ADD FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE SET NULL
      `);
      console.log("parent_id column added to folders table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add deleted_at to notes table
    try {
      await conn.execute(`
        ALTER TABLE notes ADD COLUMN deleted_at TIMESTAMP NULL
      `);
      console.log("deleted_at column added to notes table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add code_block_theme column if it doesn't exist
    try {
      await conn.execute(`
        ALTER TABLE posts ADD COLUMN code_block_theme VARCHAR(50) DEFAULT 'dark'
      `);
      console.log("code_block_theme column added to posts table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add deleted_at to posts table
    try {
      await conn.execute(`
        ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMP NULL
      `);
      console.log("deleted_at column added to posts table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Add privacy column to posts table
    try {
      await conn.execute(`
        ALTER TABLE posts ADD COLUMN privacy ENUM('public', 'friends', 'private') DEFAULT 'public'
      `);
      console.log("privacy column added to posts table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

<<<<<<< HEAD
    // Add title_alignment column to posts table
    try {
      await conn.execute(`
        ALTER TABLE posts ADD COLUMN title_alignment ENUM('left', 'center', 'right') DEFAULT 'left'
      `);
      console.log("title_alignment column added to posts table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
    // Add privacy column to notes table
    try {
      await conn.execute(`
        ALTER TABLE notes ADD COLUMN privacy ENUM('public', 'friends', 'private') DEFAULT 'private'
      `);
      console.log("privacy column added to notes table");
    } catch (err: any) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        throw err;
      }
    }

    // Create friends table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS friends (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        friend_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_friendship (user_id, friend_id)
      )
    `);

    console.log("Friends table created");

    // Create notifications table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('friend_request', 'friend_request_accepted', 'friend_request_rejected', 'admin_post', 'admin_announcement', 'friend_post', 'mention', 'comment', 'reaction', 'system') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSON,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_read (user_id, is_read),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log("Notifications table created");
<<<<<<< HEAD

    // Create shares table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS shares (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        shared_with_user_id INT NOT NULL,
        item_type ENUM('folder', 'note') NOT NULL,
        item_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_share (user_id, shared_with_user_id, item_type, item_id)
      )
    `);

    console.log("Shares table created");

    // Create saved_posts table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS saved_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        UNIQUE KEY unique_saved_post (user_id, post_id)
      )
    `);

    console.log("Saved posts table created");

    // Create translations table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS translations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(255) NOT NULL,
        language VARCHAR(10) NOT NULL,
        text_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_translation (key_name, language)
      )
    `);

    console.log("Translations table created");

    // Create bug_reports table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS bug_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('bug', 'feature_request') NOT NULL,
        message TEXT NOT NULL,
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Bug reports table created");

    // Seed default translations
    const defaultTranslations = [
      // English translations
      { key: 'nav.dashboard', lang: 'en', text: 'Dashboard' },
      { key: 'nav.tasks', lang: 'en', text: 'Tasks' },
      { key: 'nav.posts', lang: 'en', text: 'Posts' },
      { key: 'nav.friends', lang: 'en', text: 'Friends' },
      { key: 'nav.notes', lang: 'en', text: 'Notes' },
      { key: 'nav.trash', lang: 'en', text: 'Trash' },
      { key: 'nav.settings', lang: 'en', text: 'Settings' },
      { key: 'nav.profile', lang: 'en', text: 'Profile' },
      { key: 'nav.admin', lang: 'en', text: 'Admin' },
      { key: 'nav.bug_messages', lang: 'en', text: 'Bug Messages' },
      { key: 'nav.logout', lang: 'en', text: 'Logout' },
      { key: 'profile.my_profile', lang: 'en', text: 'My Profile' },
      { key: 'profile.edit_profile', lang: 'en', text: 'Edit Profile' },
      { key: 'profile.save_changes', lang: 'en', text: 'Save Changes' },
      { key: 'profile.login_required', lang: 'en', text: 'Please log in to view your profile.' },
      { key: 'friends.login_required', lang: 'en', text: 'Please log in to view friends.' },
      { key: 'profile.crop_picture', lang: 'en', text: 'Crop profile picture' },
      { key: 'profile.drag_select', lang: 'en', text: 'Drag Select' },
      { key: 'profile.box_select', lang: 'en', text: 'Box Select' },
      { key: 'profile.add_designation', lang: 'en', text: 'Add designation' },
      { key: 'profile.basic_info', lang: 'en', text: 'Basic Information' },
      { key: 'profile.name', lang: 'en', text: 'Name' },
      { key: 'profile.email', lang: 'en', text: 'Email' },
      { key: 'profile.change_password', lang: 'en', text: 'Change Password' },
      { key: 'profile.current_password', lang: 'en', text: 'Current Password' },
      { key: 'profile.new_password', lang: 'en', text: 'New Password' },
      { key: 'profile.confirm_password', lang: 'en', text: 'Confirm New Password' },
      { key: 'profile.updating', lang: 'en', text: 'Updating...' },
      { key: 'profile.social_links', lang: 'en', text: 'Social Media Links' },
      { key: 'profile.gmail_address', lang: 'en', text: 'Gmail Address' },
      { key: 'profile.github_link', lang: 'en', text: 'GitHub Link' },
      { key: 'profile.linkedin_link', lang: 'en', text: 'LinkedIn Link' },
      { key: 'profile.friends', lang: 'en', text: 'Friends' },
      { key: 'profile.connections', lang: 'en', text: 'connection' },
      { key: 'profile.connections_plural', lang: 'en', text: 'connections' },
      { key: 'profile.more_friends', lang: 'en', text: 'more friends' },
      { key: 'profile.no_friends', lang: 'en', text: 'No friends yet' },
      { key: 'profile.friends_activity', lang: 'en', text: 'Friends\' Activity' },
      { key: 'profile.recent_posts_notes', lang: 'en', text: 'Recent posts and notes' },
      { key: 'profile.no_activity', lang: 'en', text: 'No recent activity' },
      { key: 'profile.saved_posts', lang: 'en', text: 'Saved Posts' },
      { key: 'profile.saved_posts_desc', lang: 'en', text: 'Posts you\'ve saved for later' },
      { key: 'profile.no_saved_posts', lang: 'en', text: 'No saved posts yet.' },
      { key: 'profile.by', lang: 'en', text: 'By' },
      { key: 'profile.view_all_saved', lang: 'en', text: 'View all' },
      { key: 'settings.panel_settings', lang: 'en', text: 'Panel Settings' },
      { key: 'settings.manage_system', lang: 'en', text: 'Manage system settings and configurations' },
      { key: 'settings.experience_logos', lang: 'en', text: 'Experience Logos' },
      { key: 'settings.upload_logos', lang: 'en', text: 'Upload custom logos for experience categories' },
      { key: 'settings.select_experience', lang: 'en', text: 'Select Experience' },
      { key: 'settings.upload_logo', lang: 'en', text: 'Upload Logo' },
      { key: 'settings.upload_button', lang: 'en', text: 'Upload Logo' },
      { key: 'settings.other_settings', lang: 'en', text: 'Other Settings' },
      { key: 'settings.future_updates', lang: 'en', text: 'Additional admin settings will be available here in future updates' },
      { key: 'posts.posts_feed', lang: 'en', text: 'Posts Feed' },
      { key: 'posts.welcome', lang: 'en', text: 'Welcome' },
      { key: 'posts.logged_in', lang: 'en', text: 'Logged In' },
      { key: 'posts.share_thoughts', lang: 'en', text: 'Share Your Thoughts' },
      { key: 'posts.create_post', lang: 'en', text: 'Create Post' },
      { key: 'posts.all_posts', lang: 'en', text: 'All Posts' },
      { key: 'posts.no_posts', lang: 'en', text: 'No posts yet. Be the first to share!' },
      { key: 'posts.by', lang: 'en', text: 'By' },
      { key: 'posts.linked_up', lang: 'en', text: 'Linked up' },
      { key: 'posts.your_post', lang: 'en', text: 'Your Post' },
      { key: 'posts.delete', lang: 'en', text: 'Delete' },
      { key: 'posts.save', lang: 'en', text: 'Save' },
      { key: 'posts.unsave', lang: 'en', text: 'Unsave' },
      { key: 'create_post.create_post', lang: 'en', text: 'Create Post' },
      { key: 'create_post.title', lang: 'en', text: 'Title' },
      { key: 'create_post.content', lang: 'en', text: 'Content' },
      { key: 'create_post.privacy', lang: 'en', text: 'Privacy' },
      { key: 'create_post.public', lang: 'en', text: 'Public - Anyone can see this post' },
      { key: 'create_post.friends', lang: 'en', text: 'Link Ups - Only link ups can see this post' },
      { key: 'create_post.private', lang: 'en', text: 'Private - Only you can see this post' },
      { key: 'create_post.title_alignment', lang: 'en', text: 'Title Alignment' },
      { key: 'create_post.left', lang: 'en', text: 'Left' },
      { key: 'create_post.center', lang: 'en', text: 'Center' },
      { key: 'create_post.right', lang: 'en', text: 'Right' },
      { key: 'create_post.publish', lang: 'en', text: 'Publish Post' },
      { key: 'friends.friends', lang: 'en', text: 'Friends' },
      { key: 'friends.manage_connections', lang: 'en', text: 'Manage your connections and friend requests' },
      { key: 'friends.search_friends', lang: 'en', text: 'Search friends...' },
      { key: 'friends.friend_requests', lang: 'en', text: 'Friend Requests' },
      { key: 'friends.no_requests', lang: 'en', text: 'No pending friend requests' },
      { key: 'friends.accept', lang: 'en', text: 'Accept' },
      { key: 'friends.reject', lang: 'en', text: 'Reject' },
      { key: 'friends.your_friends', lang: 'en', text: 'Your Friends' },
      { key: 'friends.no_friends', lang: 'en', text: 'No friends yet. Start connecting!' },
      { key: 'friends.view_profile', lang: 'en', text: 'View Profile' },
      { key: 'friends.remove_friend', lang: 'en', text: 'Remove Friend' },
      { key: 'friends.link_up_requests', lang: 'en', text: 'Link Up Requests' },
      { key: 'friends.pending_request', lang: 'en', text: 'pending request' },
      { key: 'friends.pending_requests', lang: 'en', text: 'pending requests' },
      { key: 'friends.no_pending_requests', lang: 'en', text: 'No pending link up requests.' },
      { key: 'friends.your_link_ups', lang: 'en', text: 'Your Link Ups' },
      { key: 'friends.search_link_ups', lang: 'en', text: 'Search link ups...' },
      { key: 'friends.no_link_ups_found', lang: 'en', text: 'No link ups found matching' },
      { key: 'friends.no_link_ups_yet', lang: 'en', text: 'No link ups yet. Send some link up requests!' },
      { key: 'friends.view_profile', lang: 'en', text: 'View Profile' },
      { key: 'friends.remove', lang: 'en', text: 'Remove' },
      { key: 'friends.showing', lang: 'en', text: 'Showing' },
      { key: 'friends.of', lang: 'en', text: 'of' },
      { key: 'friends.previous', lang: 'en', text: 'Previous' },
      { key: 'friends.next', lang: 'en', text: 'Next' },
      { key: 'friends.page', lang: 'en', text: 'Page' },
      { key: 'friends.name', lang: 'en', text: 'Name' },
      { key: 'friends.email', lang: 'en', text: 'Email' },
      { key: 'friends.recent', lang: 'en', text: 'Recent' },
      { key: 'notes.notes', lang: 'en', text: 'Notes' },
      { key: 'notes.manage_notes', lang: 'en', text: 'Manage your notes and organize your thoughts' },
      { key: 'notes.create_folder', lang: 'en', text: 'Create Folder' },
      { key: 'notes.folder_name', lang: 'en', text: 'Folder Name' },
      { key: 'notes.create', lang: 'en', text: 'Create' },
      { key: 'notes.cancel', lang: 'en', text: 'Cancel' },
      { key: 'notes.search_notes', lang: 'en', text: 'Search notes...' },
      { key: 'notes.all_notes', lang: 'en', text: 'All Notes' },
      { key: 'notes.recent', lang: 'en', text: 'Recent' },
      { key: 'notes.favorites', lang: 'en', text: 'Favorites' },
      { key: 'notes.trash', lang: 'en', text: 'Trash' },
      { key: 'notes.new_note', lang: 'en', text: 'New Note' },
      { key: 'notes.edit', lang: 'en', text: 'Edit' },
      { key: 'notes.delete', lang: 'en', text: 'Delete' },
      { key: 'notes.share', lang: 'en', text: 'Share' },
      { key: 'notes.move', lang: 'en', text: 'Move' },
      { key: 'notes.copy', lang: 'en', text: 'Copy' },
      { key: 'notes.rename', lang: 'en', text: 'Rename' },
      { key: 'notes.all_notes', lang: 'en', text: 'All Notes' },
      { key: 'notes.notes_in_folder', lang: 'en', text: 'Notes in this folder' },
      { key: 'notes.all_notes_desc', lang: 'en', text: 'All your notes and folders' },
      { key: 'notes.grid', lang: 'en', text: 'Grid' },
      { key: 'notes.list', lang: 'en', text: 'List' },
      { key: 'notes.new_note', lang: 'en', text: 'New Note' },
      { key: 'notes.no_notes_folders', lang: 'en', text: 'No notes and folders in this folder' },
      { key: 'notes.no_notes_yet', lang: 'en', text: 'No notes yet' },
      { key: 'notes.create_note_folder', lang: 'en', text: 'Create a new note or folder in this folder.' },
      { key: 'notes.create_first_folder', lang: 'en', text: 'Create your first folder and start organizing your notes.' },
      { key: 'notes.folders', lang: 'en', text: 'folders' },
      { key: 'notes.notes', lang: 'en', text: 'notes' },
      { key: 'notes.download_zip', lang: 'en', text: 'Download as ZIP' },
      { key: 'notes.download_pdf', lang: 'en', text: 'Download as PDF' },
      { key: 'notes.download_word', lang: 'en', text: 'Download as Word' },
      { key: 'notes.move_to_folder', lang: 'en', text: 'Move to folder' },
      { key: 'notes.info', lang: 'en', text: 'Info' },
      { key: 'notes.creating', lang: 'en', text: 'Creating...' },
      { key: 'notes.create_note', lang: 'en', text: 'Create Note' },
      { key: 'notes.export', lang: 'en', text: 'Export' },
      // Additional missing keys for Notes section
      { key: 'notes.grid', lang: 'en', text: 'Grid' },
      { key: 'notes.list', lang: 'en', text: 'List' },
      { key: 'notes.create_file_folder', lang: 'en', text: 'Create File/Folder' },
      { key: 'notes.no_notes_yet', lang: 'en', text: 'No notes yet' },
      // Additional missing keys for Friends section
      { key: 'friends.link_up_request', lang: 'en', text: 'Link Up Request' },
      { key: 'friends.no_pending_request', lang: 'en', text: 'No pending request' },
      { key: 'friends.your_link_ups', lang: 'en', text: 'Your Link Ups' },
      // Additional missing keys for Profile section
      { key: 'profile.basic_info', lang: 'en', text: 'Basic Information' },
      { key: 'profile.friends', lang: 'en', text: 'Friends' },
      { key: 'profile.connections_plural', lang: 'en', text: 'connections' },
      { key: 'profile.no_friends', lang: 'en', text: 'No friends yet' },
      { key: 'profile.friends_activity', lang: 'en', text: 'Friends\' Activity' },
      { key: 'profile.recent_posts_notes', lang: 'en', text: 'Recent posts and notes' },
      { key: 'profile.no_activity', lang: 'en', text: 'No recent activity' },
      { key: 'profile.change_password', lang: 'en', text: 'Change Password' },
      { key: 'profile.confirm_password', lang: 'en', text: 'Confirm New Password' },
      { key: 'profile.new_password', lang: 'en', text: 'New Password' },
      { key: 'profile.social_links', lang: 'en', text: 'Social Media Links' },
      { key: 'profile.saved_posts', lang: 'en', text: 'Saved Posts' },
      { key: 'profile.gmail_address', lang: 'en', text: 'Gmail Address' },
      { key: 'profile.github_link', lang: 'en', text: 'GitHub Link' },
      { key: 'profile.linkedin_link', lang: 'en', text: 'LinkedIn Link' },
      { key: 'profile.no_saved_posts', lang: 'en', text: 'No saved posts yet.' },
      { key: 'admin.admin_dashboard', lang: 'en', text: 'Admin Dashboard' },
      { key: 'admin.welcome', lang: 'en', text: 'Welcome' },
      { key: 'admin.sign_out', lang: 'en', text: 'Sign Out' },
      { key: 'common.loading', lang: 'en', text: 'Loading...' },
      { key: 'common.save', lang: 'en', text: 'Save' },
      { key: 'common.cancel', lang: 'en', text: 'Cancel' },
      { key: 'common.delete', lang: 'en', text: 'Delete' },
      { key: 'common.edit', lang: 'en', text: 'Edit' },
      { key: 'common.view', lang: 'en', text: 'View' },
      { key: 'common.close', lang: 'en', text: 'Close' },
      { key: 'common.back', lang: 'en', text: 'Back' },
      { key: 'common.next', lang: 'en', text: 'Next' },
      { key: 'common.previous', lang: 'en', text: 'Previous' },
      { key: 'common.search', lang: 'en', text: 'Search' },
      { key: 'common.filter', lang: 'en', text: 'Filter' },
      { key: 'common.sort', lang: 'en', text: 'Sort' },
      { key: 'common.logout', lang: 'en', text: 'Logout' },
      { key: 'common.logout_confirm', lang: 'en', text: 'Are you sure you want to logout? You will be signed out and redirected to the posts page.' },
      { key: 'common.login_signup', lang: 'en', text: 'Login/Sign Up' },

      // Bangla translations
      { key: 'nav.dashboard', lang: 'bn', text: 'ড্যাশবোর্ড' },
      { key: 'nav.tasks', lang: 'bn', text: 'টাস্ক' },
      { key: 'nav.posts', lang: 'bn', text: 'পোস্ট' },
      { key: 'nav.friends', lang: 'bn', text: 'বন্ধুরা' },
      { key: 'nav.notes', lang: 'bn', text: 'নোট' },
      { key: 'nav.trash', lang: 'bn', text: 'ট্র্যাশ' },
      { key: 'nav.settings', lang: 'bn', text: 'সেটিংস' },
      { key: 'nav.profile', lang: 'bn', text: 'প্রোফাইল' },
      { key: 'nav.admin', lang: 'bn', text: 'অ্যাডমিন' },
      { key: 'nav.logout', lang: 'bn', text: 'লগ আউট' },
      { key: 'profile.my_profile', lang: 'bn', text: 'আমার প্রোফাইল' },
      { key: 'profile.edit_profile', lang: 'bn', text: 'প্রোফাইল সম্পাদনা' },
      { key: 'profile.save_changes', lang: 'bn', text: 'পরিবর্তন সংরক্ষণ' },
      { key: 'profile.login_required', lang: 'bn', text: 'আপনার প্রোফাইল দেখতে লগ ইন করুন।' },
      { key: 'friends.login_required', lang: 'bn', text: 'বন্ধুদের দেখতে লগ ইন করুন।' },
      { key: 'profile.crop_picture', lang: 'bn', text: 'প্রোফাইল ছবি ক্রপ করুন' },
      { key: 'profile.drag_select', lang: 'bn', text: 'ড্র্যাগ সিলেক্ট' },
      { key: 'profile.box_select', lang: 'bn', text: 'বক্স সিলেক্ট' },
      { key: 'profile.add_designation', lang: 'bn', text: 'পদবী যোগ করুন' },
      { key: 'profile.basic_info', lang: 'bn', text: 'মৌলিক তথ্য' },
      { key: 'profile.name', lang: 'bn', text: 'নাম' },
      { key: 'profile.email', lang: 'bn', text: 'ইমেইল' },
      { key: 'profile.change_password', lang: 'bn', text: 'পাসওয়ার্ড পরিবর্তন' },
      { key: 'profile.current_password', lang: 'bn', text: 'বর্তমান পাসওয়ার্ড' },
      { key: 'profile.new_password', lang: 'bn', text: 'নতুন পাসওয়ার্ড' },
      { key: 'profile.confirm_password', lang: 'bn', text: 'নতুন পাসওয়ার্ড নিশ্চিত করুন' },
      { key: 'profile.updating', lang: 'bn', text: 'আপডেট হচ্ছে...' },
      { key: 'profile.social_links', lang: 'bn', text: 'সোশ্যাল মিডিয়া লিঙ্ক' },
      { key: 'profile.gmail_address', lang: 'bn', text: 'জিমেইল ঠিকানা' },
      { key: 'profile.github_link', lang: 'bn', text: 'গিটহাব লিঙ্ক' },
      { key: 'profile.linkedin_link', lang: 'bn', text: 'লিঙ্কডইন লিঙ্ক' },
      { key: 'profile.friends', lang: 'bn', text: 'বন্ধুরা' },
      { key: 'profile.connections', lang: 'bn', text: 'সংযোগ' },
      { key: 'profile.connections_plural', lang: 'bn', text: 'সংযোগ' },
      { key: 'profile.more_friends', lang: 'bn', text: 'আরও বন্ধু' },
      { key: 'profile.no_friends', lang: 'bn', text: 'এখনও কোন বন্ধু নেই' },
      { key: 'profile.friends_activity', lang: 'bn', text: 'বন্ধুদের কার্যকলাপ' },
      { key: 'profile.recent_posts_notes', lang: 'bn', text: 'সাম্প্রতিক পোস্ট এবং নোট' },
      { key: 'profile.no_activity', lang: 'bn', text: 'কোন সাম্প্রতিক কার্যকলাপ নেই' },
      { key: 'profile.saved_posts', lang: 'bn', text: 'সংরক্ষিত পোস্ট' },
      { key: 'profile.saved_posts_desc', lang: 'bn', text: 'আপনার পরে জন্য সংরক্ষিত পোস্ট' },
      { key: 'profile.no_saved_posts', lang: 'bn', text: 'এখনও কোন সংরক্ষিত পোস্ট নেই।' },
      { key: 'profile.by', lang: 'bn', text: 'দ্বারা' },
      { key: 'profile.view_all_saved', lang: 'bn', text: 'সব দেখুন' },
      { key: 'settings.panel_settings', lang: 'bn', text: 'প্যানেল সেটিংস' },
      { key: 'settings.manage_system', lang: 'bn', text: 'সিস্টেম সেটিংস এবং কনফিগারেশন পরিচালনা করুন' },
      { key: 'settings.experience_logos', lang: 'bn', text: 'অভিজ্ঞতা লোগো' },
      { key: 'settings.upload_logos', lang: 'bn', text: 'অভিজ্ঞতা ক্যাটাগরির জন্য কাস্টম লোগো আপলোড করুন' },
      { key: 'settings.select_experience', lang: 'bn', text: 'অভিজ্ঞতা নির্বাচন করুন' },
      { key: 'settings.upload_logo', lang: 'bn', text: 'লোগো আপলোড' },
      { key: 'settings.upload_button', lang: 'bn', text: 'লোগো আপলোড' },
      { key: 'settings.other_settings', lang: 'bn', text: 'অন্যান্য সেটিংস' },
      { key: 'settings.future_updates', lang: 'bn', text: 'ভবিষ্যত আপডেটে অতিরিক্ত অ্যাডমিন সেটিংস এখানে উপলব্ধ হবে' },
      { key: 'posts.posts_feed', lang: 'bn', text: 'পোস্ট ফিড' },
      { key: 'posts.welcome', lang: 'bn', text: 'স্বাগতম' },
      { key: 'posts.logged_in', lang: 'bn', text: 'লগ ইন করা' },
      { key: 'posts.share_thoughts', lang: 'bn', text: 'আপনার চিন্তা শেয়ার করুন' },
      { key: 'posts.create_post', lang: 'bn', text: 'পোস্ট তৈরি করুন' },
      { key: 'posts.all_posts', lang: 'bn', text: 'সব পোস্ট' },
      { key: 'posts.no_posts', lang: 'bn', text: 'এখনও কোন পোস্ট নেই। প্রথম শেয়ার করুন!' },
      { key: 'posts.by', lang: 'bn', text: 'দ্বারা' },
      { key: 'posts.linked_up', lang: 'bn', text: 'লিঙ্কড আপ' },
      { key: 'posts.your_post', lang: 'bn', text: 'আপনার পোস্ট' },
      { key: 'posts.delete', lang: 'bn', text: 'মুছুন' },
      { key: 'posts.save', lang: 'bn', text: 'সংরক্ষণ করুন' },
      { key: 'posts.unsave', lang: 'bn', text: 'সংরক্ষণ বাতিল করুন' },
      { key: 'create_post.create_post', lang: 'bn', text: 'পোস্ট তৈরি করুন' },
      { key: 'create_post.title', lang: 'bn', text: 'শিরোনাম' },
      { key: 'create_post.content', lang: 'bn', text: 'বিষয়বস্তু' },
      { key: 'create_post.privacy', lang: 'bn', text: 'গোপনীয়তা' },
      { key: 'create_post.public', lang: 'bn', text: 'পাবলিক - যে কেউ এই পোস্ট দেখতে পারে' },
      { key: 'create_post.friends', lang: 'bn', text: 'লিঙ্ক আপ - শুধু লিঙ্ক আপ দেখতে পারে' },
      { key: 'create_post.private', lang: 'bn', text: 'প্রাইভেট - শুধু আপনি দেখতে পারেন' },
      { key: 'create_post.title_alignment', lang: 'bn', text: 'শিরোনাম সারিবদ্ধকরণ' },
      { key: 'create_post.left', lang: 'bn', text: 'বাম' },
      { key: 'create_post.center', lang: 'bn', text: 'কেন্দ্র' },
      { key: 'create_post.right', lang: 'bn', text: 'ডান' },
      { key: 'create_post.publish', lang: 'bn', text: 'পোস্ট প্রকাশ করুন' },
      { key: 'friends.friends', lang: 'bn', text: 'বন্ধুরা' },
      { key: 'friends.manage_connections', lang: 'bn', text: 'আপনার সংযোগ এবং বন্ধু অনুরোধ পরিচালনা করুন' },
      { key: 'friends.search_friends', lang: 'bn', text: 'বন্ধু খুঁজুন...' },
      { key: 'friends.friend_requests', lang: 'bn', text: 'বন্ধু অনুরোধ' },
      { key: 'friends.no_requests', lang: 'bn', text: 'কোন মুলতুবি বন্ধু অনুরোধ নেই' },
      { key: 'friends.accept', lang: 'bn', text: 'গ্রহণ করুন' },
      { key: 'friends.reject', lang: 'bn', text: 'প্রত্যাখ্যান করুন' },
      { key: 'friends.your_friends', lang: 'bn', text: 'আপনার বন্ধুরা' },
      { key: 'friends.no_friends', lang: 'bn', text: 'এখনও কোন বন্ধু নেই। সংযোগ শুরু করুন!' },
      { key: 'friends.view_profile', lang: 'bn', text: 'প্রোফাইল দেখুন' },
      { key: 'friends.remove_friend', lang: 'bn', text: 'বন্ধু সরান' },
      { key: 'friends.link_up_requests', lang: 'bn', text: 'লিঙ্ক আপ অনুরোধ' },
      { key: 'friends.pending_request', lang: 'bn', text: 'মুলতুবি অনুরোধ' },
      { key: 'friends.pending_requests', lang: 'bn', text: 'মুলতুবি অনুরোধ' },
      { key: 'friends.no_pending_requests', lang: 'bn', text: 'কোন মুলতুবি লিঙ্ক আপ অনুরোধ নেই।' },
      { key: 'friends.your_link_ups', lang: 'bn', text: 'আপনার লিঙ্ক আপ' },
      { key: 'friends.search_link_ups', lang: 'bn', text: 'লিঙ্ক আপ খুঁজুন...' },
      { key: 'friends.no_link_ups_found', lang: 'bn', text: 'কোন লিঙ্ক আপ পাওয়া যায়নি' },
      { key: 'friends.view_profile', lang: 'bn', text: 'প্রোফাইল দেখুন' },
      { key: 'friends.remove', lang: 'bn', text: 'সরান' },
      { key: 'friends.showing', lang: 'bn', text: 'দেখাচ্ছে' },
      { key: 'friends.of', lang: 'bn', text: 'এর' },
      { key: 'friends.previous', lang: 'bn', text: 'পূর্ববর্তী' },
      { key: 'friends.next', lang: 'bn', text: 'পরবর্তী' },
      { key: 'friends.page', lang: 'bn', text: 'পৃষ্ঠা' },
      { key: 'friends.name', lang: 'bn', text: 'নাম' },
      { key: 'friends.email', lang: 'bn', text: 'ইমেইল' },
      { key: 'friends.recent', lang: 'bn', text: 'সাম্প্রতিক' },
      { key: 'notes.notes', lang: 'bn', text: 'নোট' },
      { key: 'notes.manage_notes', lang: 'bn', text: 'আপনার নোট পরিচালনা করুন এবং আপনার চিন্তা সংগঠিত করুন' },
      { key: 'notes.create_folder', lang: 'bn', text: 'ফোল্ডার তৈরি করুন' },
      { key: 'notes.folder_name', lang: 'bn', text: 'ফোল্ডার নাম' },
      { key: 'notes.create', lang: 'bn', text: 'তৈরি করুন' },
      { key: 'notes.cancel', lang: 'bn', text: 'বাতিল' },
      { key: 'notes.search_notes', lang: 'bn', text: 'নোট খুঁজুন...' },
      { key: 'notes.all_notes', lang: 'bn', text: 'সব নোট' },
      { key: 'notes.recent', lang: 'bn', text: 'সাম্প্রতিক' },
      { key: 'notes.favorites', lang: 'bn', text: 'পছন্দ' },
      { key: 'notes.trash', lang: 'bn', text: 'ট্র্যাশ' },
      { key: 'notes.new_note', lang: 'bn', text: 'নতুন নোট' },
      { key: 'notes.edit', lang: 'bn', text: 'সম্পাদনা' },
      { key: 'notes.delete', lang: 'bn', text: 'মুছুন' },
      { key: 'notes.share', lang: 'bn', text: 'শেয়ার' },
      { key: 'notes.move', lang: 'bn', text: 'সরান' },
      { key: 'notes.copy', lang: 'bn', text: 'কপি' },
      { key: 'notes.rename', lang: 'bn', text: 'নাম পরিবর্তন' },
      { key: 'notes.all_notes', lang: 'bn', text: 'সব নোট' },
      { key: 'notes.notes_in_folder', lang: 'bn', text: 'এই ফোল্ডারে নোট' },
      { key: 'notes.all_notes_desc', lang: 'bn', text: 'আপনার সব নোট এবং ফোল্ডার' },
      { key: 'notes.grid', lang: 'bn', text: 'গ্রিড' },
      { key: 'notes.list', lang: 'bn', text: 'লিস্ট' },
      { key: 'notes.new_note', lang: 'bn', text: 'নতুন নোট' },
      { key: 'notes.no_notes_folders', lang: 'bn', text: 'এই ফোল্ডারে কোন নোট এবং ফোল্ডার নেই' },
      { key: 'notes.no_notes_yet', lang: 'bn', text: 'এখনও কোন নোট নেই' },
      { key: 'notes.create_note_folder', lang: 'bn', text: 'এই ফোল্ডারে একটি নতুন নোট বা ফোল্ডার তৈরি করুন।' },
      { key: 'notes.create_first_folder', lang: 'bn', text: 'আপনার প্রথম ফোল্ডার তৈরি করুন এবং আপনার নোট সংগঠিত করা শুরু করুন।' },
      { key: 'notes.folders', lang: 'bn', text: 'ফোল্ডার' },
      { key: 'notes.notes', lang: 'bn', text: 'নোট' },
      { key: 'notes.download_zip', lang: 'bn', text: 'ZIP হিসেবে ডাউনলোড' },
      { key: 'notes.download_pdf', lang: 'bn', text: 'PDF হিসেবে ডাউনলোড' },
      { key: 'notes.download_word', lang: 'bn', text: 'Word হিসেবে ডাউনলোড' },
      { key: 'notes.move_to_folder', lang: 'bn', text: 'ফোল্ডারে সরান' },
      { key: 'notes.info', lang: 'bn', text: 'তথ্য' },
      { key: 'notes.creating', lang: 'bn', text: 'তৈরি হচ্ছে...' },
      { key: 'notes.create_note', lang: 'bn', text: 'নোট তৈরি করুন' },
      { key: 'notes.export', lang: 'bn', text: 'এক্সপোর্ট' },
      { key: 'admin.admin_dashboard', lang: 'bn', text: 'অ্যাডমিন ড্যাশবোর্ড' },
      { key: 'admin.welcome', lang: 'bn', text: 'স্বাগতম' },
      { key: 'admin.sign_out', lang: 'bn', text: 'সাইন আউট' },
      { key: 'common.loading', lang: 'bn', text: 'লোড হচ্ছে...' },
      { key: 'common.save', lang: 'bn', text: 'সংরক্ষণ' },
      { key: 'common.cancel', lang: 'bn', text: 'বাতিল' },
      { key: 'common.delete', lang: 'bn', text: 'মুছুন' },
      { key: 'common.edit', lang: 'bn', text: 'সম্পাদনা' },
      { key: 'common.view', lang: 'bn', text: 'দেখুন' },
      { key: 'common.close', lang: 'bn', text: 'বন্ধ' },
      { key: 'common.back', lang: 'bn', text: 'পিছনে' },
      { key: 'common.next', lang: 'bn', text: 'পরবর্তী' },
      { key: 'common.previous', lang: 'bn', text: 'পূর্ববর্তী' },
      { key: 'common.search', lang: 'bn', text: 'খুঁজুন' },
      { key: 'common.filter', lang: 'bn', text: 'ফিল্টার' },
      { key: 'common.sort', lang: 'bn', text: 'সাজান' },
      { key: 'common.logout', lang: 'bn', text: 'লগ আউট' },
      { key: 'common.logout_confirm', lang: 'bn', text: 'আপনি কি লগ আউট করতে চান? আপনি সাইন আউট হয়ে পোস্ট পেজে রিডাইরেক্ট হবেন।' },
      { key: 'common.login_signup', lang: 'bn', text: 'লগইন/সাইন আপ' },
      // Additional missing keys for Notes section
      { key: 'notes.grid', lang: 'bn', text: 'গ্রিড' },
      { key: 'notes.list', lang: 'bn', text: 'তালিকা' },
      { key: 'notes.create_file_folder', lang: 'bn', text: 'ফাইল/ফোল্ডার তৈরি করুন' },
      { key: 'notes.no_notes_yet', lang: 'bn', text: 'এখনও কোন নোট নেই' },
      // Additional missing keys for Friends section
      { key: 'friends.link_up_request', lang: 'bn', text: 'লিঙ্ক আপ রিকোয়েস্ট' },
      { key: 'friends.no_pending_request', lang: 'bn', text: 'কোন পেন্ডিং রিকোয়েস্ট নেই' },
      { key: 'friends.your_link_ups', lang: 'bn', text: 'আপনার লিঙ্ক আপস' },
      // Additional missing keys for Profile section
      { key: 'profile.basic_info', lang: 'bn', text: 'মৌলিক তথ্য' },
      { key: 'profile.friends', lang: 'bn', text: 'বন্ধুরা' },
      { key: 'profile.connections_plural', lang: 'bn', text: 'সংযোগ' },
      { key: 'profile.no_friends', lang: 'bn', text: 'এখনও কোন বন্ধু নেই' },
      { key: 'profile.friends_activity', lang: 'bn', text: 'বন্ধুদের কার্যকলাপ' },
      { key: 'profile.recent_posts_notes', lang: 'bn', text: 'সাম্প্রতিক পোস্ট এবং নোট' },
      { key: 'profile.no_activity', lang: 'bn', text: 'কোন সাম্প্রতিক কার্যকলাপ নেই' },
      { key: 'profile.change_password', lang: 'bn', text: 'পাসওয়ার্ড পরিবর্তন' },
      { key: 'profile.confirm_password', lang: 'bn', text: 'নতুন পাসওয়ার্ড নিশ্চিত করুন' },
      { key: 'profile.new_password', lang: 'bn', text: 'নতুন পাসওয়ার্ড' },
      { key: 'profile.social_links', lang: 'bn', text: 'সোশ্যাল মিডিয়া লিঙ্ক' },
      { key: 'profile.saved_posts', lang: 'bn', text: 'সংরক্ষিত পোস্ট' },
      { key: 'profile.gmail_address', lang: 'bn', text: 'জিমেইল ঠিকানা' },
      { key: 'profile.github_link', lang: 'bn', text: 'গিটহাব লিঙ্ক' },
      { key: 'profile.linkedin_link', lang: 'bn', text: 'লিঙ্কডইন লিঙ্ক' },
      { key: 'profile.no_saved_posts', lang: 'bn', text: 'এখনও কোন সংরক্ষিত পোস্ট নেই।' },
    ];

    for (const translation of defaultTranslations) {
      await conn.execute(`
        INSERT IGNORE INTO translations (key_name, language, text_value)
        VALUES (?, ?, ?)
      `, [translation.key, translation.lang, translation.text]);
    }

    console.log("Default translations seeded");
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
    const [users] = await conn.execute<any[]>("SELECT * FROM users WHERE id = 1");
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash("user123", 10);
      await conn.execute(
        "INSERT INTO users (id, name, email, password, role, provider, provider_id) VALUES (1, 'Default User', 'default@example.com', ?, 'user', 'local', 'local_1')",
        [hashedPassword]
      );
      console.log("Default user (ID: 1) created with password: user123");
    }

    // Seed admin user if not exists
    const [adminUsers] = await conn.execute<any[]>(
      "SELECT * FROM users WHERE email = ? AND role = 'admin'",
      ["admin@example.com"]
    );

    if (adminUsers.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await conn.execute(
        "INSERT INTO users (username, name, email, password, role, provider, provider_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ["admin", "Admin User", "admin@example.com", hashedPassword, "admin", "local", "local_admin"]
      );
      console.log("Admin user created - Username: admin, Password: admin123");
    }

    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization error:", err);
    throw err;
  } finally {
    conn.release();
  }
}

export { pool };
