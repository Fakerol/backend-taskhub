import request from "supertest";
import app from "../src/app.js";

describe("Auth API", () => {
  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "John Doe", email: "john@example.com", password: "secret123" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
