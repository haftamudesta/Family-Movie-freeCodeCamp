import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findByUsername } from "../utils/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required.",
      });
    }

    const user = findByUsername(username);

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials.",
      });
    }

    let isMatch = false;

    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } else if (typeof user._password === "string") {
      isMatch = password === user._password;
    }

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials.",
      });
    }

    const secret = process.env.JWT_SECRET || "your_jwt_secret";

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      secret,
      { expiresIn: "1h" },
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: "Internal server error.",
    });
  }
});

export default router;
