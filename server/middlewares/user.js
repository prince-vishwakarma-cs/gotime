import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config.js"
import { pool } from "../api/index.js";

export const validateUserLogin = (req, res, next) => {
    const {  email,password } = req.body
    
    if (!password || !email) {
        return res.status(400).json({
            error: 'Missing required fields: email,password'
        })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Invalid email format'
        })
    }
    next()
}

export const validateProfileUpdate = (req, res, next) => {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
            error: 'Missing or invalid required field: name'
        });
    }

    next();
};

export const validatePasswordChange = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            error: 'Missing required fields: currentPassword, newPassword'
        });
    }

    // You can add more complex password rules here
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return res.status(400).json({
            error: 'New password must be at least 8 characters long'
        });
    }

    next();
};


export const validateAccountDeletion = (req, res, next) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({
            error: 'Missing required field for confirmation: password'
        });
    }

    next();
};

export const validateUserRegistration = (req, res, next) => {
    const { name, email,password } = req.body
    
    if (!name || !email || !password) {
        return res.status(400).json({
            error: 'Missing required fields: name, email, password'
        })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Invalid email format'
        })
    }
    next()
}

export const isAuthenticated = (req, res, next) => {
  try {
    // ✅ **NEW APPROACH: Get token from cookies**
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ error: "Access denied. Please login." });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.userId = payload.id;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Token is invalid or expired." });
    }
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const adminAuthenticated =async (req, res, next) => {
  try {
    const userId = req.userId

    const output = await pool.query(
      `SELECT role FROM users WHERE id=$1`,[userId]
    )
    if(output.rows[0].role=="user") return res.status(403).json({ error: "Not authorized" });

    next();

  } catch (error) {
    console.error("Error in authentication middleware:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


