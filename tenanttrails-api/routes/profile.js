import { Router } from "express";

import { pool } from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, email, initials FROM users WHERE id = ?",
      [req.user.id]
    );

    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [reviews] = await pool.execute(
      `
        SELECT
          r.id,
          r.apt_id AS aptId,
          r.user_id AS userId,
          a.name AS apartmentName,
          r.rating,
          r.body,
          r.created AS date
        FROM reviews r
        JOIN apartments a ON a.id = r.apt_id
        WHERE r.user_id = ?
        ORDER BY r.created DESC, r.id DESC
      `,
      [req.user.id]
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        initials: user.initials,
      },
      reviews,
    });
  } catch (error) {
    console.error("Fetch profile failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
