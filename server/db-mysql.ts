import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

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

    // Seed default user if not exists
    const [users] = await conn.execute<any[]>("SELECT * FROM users WHERE id = 1");
    if (users.length === 0) {
      await conn.execute(
        "INSERT INTO users (id, name, email, role, provider, provider_id) VALUES (1, 'Default User', 'default@example.com', 'user', 'local', 'local_1')"
      );
      console.log("Default user (ID: 1) created");
    }

    // Seed admin user if not exists
    const [adminUsers] = await conn.execute<any[]>(
      "SELECT * FROM users WHERE email = ? AND role = 'admin'",
      ["admin@example.com"]
    );

    if (adminUsers.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await conn.execute(
        "INSERT INTO users (name, email, password, role, provider, provider_id) VALUES (?, ?, ?, ?, ?, ?)",
        ["Admin User", "admin@example.com", hashedPassword, "admin", "local", "local_admin"]
      );
      console.log("Admin user created - Email: admin@example.com, Password: admin123");
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
