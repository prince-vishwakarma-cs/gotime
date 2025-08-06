import cors from "cors";

import express from "express";

import { Pool } from "pg";

import authRouter from "./routes/auth.js";

import eventRouter from "./routes/event.js";

import userRouter from "./routes/user.js";

import { DATABASE_URI, PORT } from "./utils/config.js";

import { initializeDatabase } from "./utils/db.js";

const app = express();

export const pool = new Pool({
  connectionString: DATABASE_URI,
});

app.use(cors());

app.use(express.json());

app.use(cookieParser());

initializeDatabase();

app.use("/api/user", userRouter);

app.use("/api/events", eventRouter);

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Event Management API",

    version: "1.0.0",

    endpoints: {
      "POST /api/user/new": "Create a new user",

      "POST /api/user/login": "Login user",

      "GET /api/user/all": "Get all users",

      "POST /api/events": "Create a new event",

      "GET /api/events": "List upcoming events",

      "GET /api/events/:id": "Get event details",

      "POST /api/events/:id/register": "Register for an event",

      "DELETE /api/events/:id/register": "Cancel registration",

      "GET /api/events/:id/stats": "Get event statistics",
    },
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  res.status(500).json({
    error: "Internal server error",
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
