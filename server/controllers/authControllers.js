import bcrypt from "bcryptjs";
import {
  BCRYPT_SALT_ROUNDS,
  clearTokenCookie,
  sendTokenCookie,
} from "../config/auth.js";
import { pool } from "../index.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let result;
    const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    if (role) {
      result = await pool.query(
        `INSERT INTO users (name, email, password) 
         VALUES ($1, $2, $3,$4) RETURNING *`,
        [name, email, hashed, role]
      );
    } else {
      result = await pool.query(
        `INSERT INTO users (name, email, password) 
         VALUES ($1, $2, $3) RETURNING *`,
        [name, email, hashed]
      );
    }
    const { password: _, ...user } = result.rows[0];
    return res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already in use" });
    }
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      `SELECT id, password FROM users WHERE email = $1`,
      [email]
    );
    if (result.rows.length < 1) {
      return res
        .status(400)
        .json({ error: "No account found with that email" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    
    sendTokenCookie(res, user);

    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT id, name, email, role, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length !== 1) {
      clearTokenCookie(res);
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error getting user info:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    const result = await pool.query(
      `UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email`,
      [name, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const userResult = await pool.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const storedHash = userResult.rows[0].password;

    const isMatch = await bcrypt.compare(currentPassword, storedHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    const newHashedPassword = await bcrypt.hash(
      newPassword,
      BCRYPT_SALT_ROUNDS
    );

    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [
      newHashedPassword,
      userId,
    ]);

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const allUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, created_at 
       FROM users ORDER BY name`
    );
    return res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.userId;

    const userResult = await pool.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, userResult.rows[0].password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Incorrect password. Account deletion denied." });
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

    clearTokenCookie(res);

    return res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    clearTokenCookie(res)
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
