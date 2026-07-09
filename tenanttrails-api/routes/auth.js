import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { pool } from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const initials = getInitials(name);

    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, initials) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, initials]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      initials,
    };
    const token = signToken(user.id);

    res.cookie("token", token, getCookieOptions());
    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    console.error("Signup failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, password, initials FROM users WHERE email = ?",
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(user.id);

    res.cookie("token", token, getCookieOptions());
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
      },
    });
  } catch (error) {
    console.error("Login failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (_req, res) => {
  const { httpOnly, sameSite, secure } = getCookieOptions();

  res.clearCookie("token", {
    httpOnly,
    sameSite,
    secure,
  });
  res.json({ ok: true });
});

router.get("/me", auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, initials FROM users WHERE id = ?",
      [req.user.id]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
      },
    });
  } catch (error) {
    console.error("Fetch current user failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
