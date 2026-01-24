import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { initDatabase } from "./db-mysql.js";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize database and register routes
async function startServer() {
  try {
    await initDatabase();
    await registerRoutes(httpServer, app);

    // Serve static files in production
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    }

    const port = process.env.PORT || 3000;
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();