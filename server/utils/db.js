import { Client } from "pg";
import { pool } from "../index.js";

export const dbConnect = async (uri) => {
  const client = new Client({ connectionString: uri });
  try {
    await client.connect();
    console.log("Database connected successfully");
  } catch (e) {
    console.error("Database connection error:", e);
  }
};

export const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

      await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        location VARCHAR(255) NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 100,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_public BOOLEAN DEFAULT true,
        image_url TEXT,
        organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'waitlisted', 'checked_in', 'cancelled')),
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        feedback_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
        review TEXT
      );
    `);

    console.log("Database schema initialized successfully");
    return pool;
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

