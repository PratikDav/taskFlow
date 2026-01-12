# Setup & Usage Guide

## 🚀 What's Been Implemented

This project now includes a **complete authentication system** with role-based access control:

### ✅ Two Login Modes
1. **User Panel** - Social login (Google, Facebook, GitHub) 
2. **Admin Panel** - Credential-based login (username/password)

### ✅ Databases
- **MySQL** running on XAMPP (localhost:3306)
- Database name: `taskFlow`
- Tables: `users` (credentials + role) and `posts` (content + relationships)

### ✅ Features
- Session-based authentication
- Role-based access control (User vs Admin)
- Admin can manage all posts
- Users can create and delete their own posts
- Admin dashboard with statistics

---

## 🔧 Setup Instructions

### 1. Start XAMPP MySQL
- Open XAMPP Control Panel
- Start **MySQL** module
- Database will be on `localhost:3306`

### 2. Create Database
- Open phpMyAdmin (http://localhost/phpmyadmin)
- Create a new database named: **`taskFlow`**
- Tables will be auto-created on app startup

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```
- Backend runs on: `http://localhost:5001`
- Frontend runs on: `http://localhost:5173`

---

## 📝 How to Create Admin Account

### Option A: Via API (when app is running)
```bash
POST http://localhost:5001/api/auth/admin/create
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "name": "Admin User",
  "email": "admin@example.com"
}
```

### Option B: Direct Database Insert
```sql
INSERT INTO users (provider, username, password, name, email, role, created_at) 
VALUES (NULL, 'admin', 'admin123', 'Admin User', 'admin@example.com', 'admin', NOW());
```

---

## 🎯 Testing the System

### **Admin Login Flow**
1. Go to `http://localhost:5173` 
2. Click **"Admin"** tab on login page
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. Access admin dashboard with statistics and post management

### **User Login Flow**
1. Go to `http://localhost:5173`
2. Click **"User"** tab on login page
3. Select a social provider (Google/Facebook/GitHub - mocked for testing)
4. Select a **role**: User or Admin
5. Access posts feed and create posts

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server/db-mysql.ts` | MySQL connection & schema |
| `server/storage.ts` | Data access layer |
| `server/routes.ts` | API endpoints |
| `client/src/pages/Login.tsx` | Authentication UI |
| `client/src/pages/Admin.tsx` | Admin dashboard |
| `client/src/pages/Posts.tsx` | User posts feed |
| `.env` | Configuration (MySQL credentials, PORT) |

---

## 🔐 Database Schema

### `users` Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(50),           -- 'google', 'facebook', 'github', NULL for credentials
  provider_id VARCHAR(255),       -- ID from social provider
  username VARCHAR(255),          -- For credential login
  password VARCHAR(255),          -- For credential login
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `posts` Table
```sql
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/:provider` - Social login (google, facebook, github)
- `POST /api/auth/admin/login` - Credential login (username/password)
- `POST /api/auth/admin/create` - Create new admin account
- `GET /api/me` - Get current user
- `POST /api/logout` - Logout

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create post (authenticated)
- `PUT /api/posts/:id` - Update post (own posts or admin)
- `DELETE /api/posts/:id` - Delete post (own posts or admin)

---

## 🎨 UI Breakdown

### Login Page (`/login`)
- **User Tab**: Social provider buttons + role selector
- **Admin Tab**: Username & password inputs

### Admin Dashboard (`/admin`)
- **Header**: Admin name + Sign out button
- **Stats**: Total posts, Your posts, Role badge
- **Post Management**: View all posts with delete capability

### User Posts (`/posts`)
- **Create Form**: New post creation
- **Posts Feed**: All posts with user names
- **Actions**: Delete own posts

---

## ⚙️ Configuration

Edit `.env` file to change:
```env
MYSQL_HOST=localhost        # MySQL host
MYSQL_PORT=3306             # MySQL port
MYSQL_USER=root             # MySQL username
MYSQL_PASSWORD=             # MySQL password (empty for XAMPP default)
MYSQL_DATABASE=taskFlow     # Database name
PORT=5001                   # Backend port
```

---

## 🐛 Troubleshooting

### "Can't connect to MySQL"
- Make sure XAMPP MySQL is running
- Check `MYSQL_HOST` and `MYSQL_PORT` in `.env`

### "Database not found"
- Create `taskFlow` database in phpMyAdmin
- Restart the app to auto-create tables

### "Admin login fails"
- Create an admin account using one of the methods above
- Verify credentials in database: `SELECT * FROM users WHERE username='admin';`

### "Posts not showing"
- Check if user is logged in (`/api/me` returns data)
- Verify posts exist in database: `SELECT * FROM posts;`

---

## 📱 Session Management

User sessions are stored server-side using `express-session`. Session data includes:
- User ID
- Name
- Email
- Role (user/admin)
- Provider (social provider used, or null for credentials)

Sessions persist across page reloads until logout.

---

## 🚀 Production Notes

Before deploying:
1. Change `SESSION_SECRET` in `.env` to a secure random string
2. Use environment-specific `.env` files
3. Implement actual social provider OAuth (currently mocked)
4. Hash passwords (currently stored as plaintext - use bcrypt)
5. Use production MySQL with proper credentials
6. Set `NODE_ENV=production`

---

## 📞 Support

If you encounter issues:
1. Check `npm run dev` console for error messages
2. Check browser console (F12) for client-side errors
3. Verify MySQL is running and database exists
4. Review `.env` configuration
5. Check that all files in `server/` and `client/src/` are present
