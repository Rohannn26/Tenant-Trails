import { Router } from "express";
import { pool } from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

const apartmentCardQuery = `
  SELECT
    a.id,
    a.name,
    a.address,
    a.neighbourhood,
    a.landlord,
    a.units,
    a.built,
    a.verified,
    COALESCE(ROUND(AVG(r.rating), 1), 0) AS rating,
    COUNT(r.id) AS reviews
  FROM apartments a
  LEFT JOIN reviews r ON r.apt_id = a.id
`;

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      ${apartmentCardQuery}
      GROUP BY a.id, a.name, a.address, a.neighbourhood, a.landlord, a.units, a.built, a.verified
      ORDER BY a.name
    `);

    res.json(rows);
  } catch (error) {
    console.error("Fetch apartments failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
        ${apartmentCardQuery}
        WHERE a.id = ?
        GROUP BY a.id, a.name, a.address, a.neighbourhood, a.landlord, a.units, a.built, a.verified
      `,
      [req.params.id]
    );

    const apartment = rows[0];

    if (!apartment) {
      return res.status(404).json({ error: "Apartment not found" });
    }

    res.json(apartment);
  } catch (error) {
    console.error("Fetch apartment failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
        SELECT
          r.id,
          r.apt_id AS aptId,
          r.user_id AS userId,
          r.rating,
          r.body,
          r.created AS date,
          u.name AS author,
          u.initials AS initials
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        WHERE r.apt_id = ?
        ORDER BY r.created DESC, r.id DESC
      `,
      [req.params.id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Fetch apartment reviews failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/reviews", auth, async (req, res) => {
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
    const [apartments] = await pool.execute("SELECT id FROM apartments WHERE id = ?", [req.params.id]);

    if (apartments.length === 0) {
      return res.status(404).json({ error: "Apartment not found" });
    }

    const [result] = await pool.execute(
      `
        INSERT INTO reviews (apt_id, user_id, rating, body, created)
        VALUES (?, ?, ?, ?, CURRENT_DATE())
      `,
      [req.params.id, req.user.id, numericRating, trimmedBody]
    );

    const [rows] = await pool.execute(
      `
        SELECT
          id,
          apt_id AS aptId,
          user_id AS userId,
          rating,
          body,
          created AS date
        FROM reviews
        WHERE id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create review failed", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
