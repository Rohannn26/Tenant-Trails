import request from "supertest";
import { describe, expect, test } from "vitest";

process.env.NODE_ENV = "test";

const { default: app } = await import("../server.js");

describe("apartments routes", () => {
  test("GET /api/apartments returns apartment cards", async () => {
    const response = await request(app).get("/api/apartments");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("name");
    expect(response.body[0]).toHaveProperty("rating");
    expect(response.body[0]).toHaveProperty("reviews");
  });

  test("POST /api/apartments/1/reviews without token returns 401", async () => {
    const response = await request(app)
      .post("/api/apartments/1/reviews")
      .send({ rating: 5, body: "Nice building." });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  });
});
