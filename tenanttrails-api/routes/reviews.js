import { Router } from "express";
import { pool } from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

router.put("/:id", auth, async (req, res) => {
  const { rating, body } = req.body;
  const numericRating = Number(rating);
  const trimmedBody = typeof body === "string" ? body.trim() : "";

  if (!rating || Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  if (!trimmedBody) {
    return res.status(400).json({ error: "Review body is required" });
  }

  try {
    const [reviews] = await pool.execute("SELECT user_id FROM reviews WHERE id = ?", [req.params.id]);
    const review = reviews[0];

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: "Not your review" });
    }

    await pool.execute("UPDATE reviews SET rating = ?, body = ? WHERE id = ?", [
      numericRating,
      trimmedBody,
      req.params.id,
    ]);

    res.json({ ok: true });
  } catch (error) {
    console.error("Update review failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id/comments", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
        SELECT
          c.id,
          c.review_id AS reviewId,
          c.user_id AS userId,
          c.body,
          c.created,
          u.name AS author,
          u.initials AS initials
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.review_id = ?
        ORDER BY c.created ASC, c.id ASC
      `,
      [req.params.id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Fetch comments failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/comments", auth, async (req, res) => {
  const trimmedBody = typeof req.body.body === "string" ? req.body.body.trim() : "";

  if (!trimmedBody) {
    return res.status(400).json({ error: "Comment body is required" });
  }

  try {
    const [reviews] = await pool.execute("SELECT id FROM reviews WHERE id = ?", [req.params.id]);

    if (reviews.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    const [result] = await pool.execute(
      `
        INSERT INTO comments (review_id, user_id, body, created)
        VALUES (?, ?, ?, NOW())
      `,
      [req.params.id, req.user.id, trimmedBody]
    );

    const [rows] = await pool.execute(
      `
        SELECT
          id,
          review_id AS reviewId,
          user_id AS userId,
          body,
          created
        FROM comments
        WHERE id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create comment failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  let connection;

  try {
    const [reviews] = await pool.execute("SELECT user_id FROM reviews WHERE id = ?", [req.params.id]);
    const review = reviews[0];

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: "Not your review" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    await connection.execute("DELETE FROM comments WHERE review_id = ?", [req.params.id]);
    await connection.execute("DELETE FROM reviews WHERE id = ?", [req.params.id]);
    await connection.commit();

    res.json({ ok: true });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Delete review failed", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    connection?.release();
  }
});

export default router;
