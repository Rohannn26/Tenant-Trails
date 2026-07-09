import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pool, testConnection } from "./db.js";
import authRoutes from "./routes/auth.js";
import apartmentRoutes from "./routes/apartments.js";
import profileRoutes from "./routes/profile.js";
import reviewRoutes from "./routes/reviews.js";
import uploadRoutes from "./routes/upload.js";

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "tenanttrails-api" });
});

app.get("/api/db-check", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ database: "connected", result: rows });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error", error);
  res.status(500).json({ error: "Server error" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, async () => {
    console.log(`TenantTrails API listening on port ${PORT}`);

    try {
      await testConnection();
    } catch (error) {
      console.error("MySQL connection failed", error);
    }
  });
}

export default app;
