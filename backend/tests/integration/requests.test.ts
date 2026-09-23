import request from "supertest";
import app from "../../src/app";
import { connectTestDB, clearCollections, disconnectTestDB } from "./helpers/db";
import User from "../../src/models/User.model";
import bcrypt from "bcryptjs";
import { UserRole } from "../../src/constants/request.constants";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearCollections();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function createUserAndLogin(
  email: string,
  role: UserRole = UserRole.USER
): Promise<string> {
  const hashedPw = await bcrypt.hash("password123", 10);
  await User.create({ name: "Test", email, password: hashedPw, role });
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  return res.body.data.accessToken as string;
}

async function createRequest(token: string, overrides: Record<string, unknown> = {}) {
  return request(app)
    .post("/api/requests")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Test request title",
      description: "A sufficiently long description for the test case.",
      category: "TECHNICAL",
      priority: "MEDIUM",
      ...overrides,
    });
}

// ── Create ────────────────────────────────────────────────────────────────────

describe("POST /api/requests", () => {
  it("creates a request with server-controlled fields", async () => {
    const token = await createUserAndLogin("user@example.com");
    const res = await createRequest(token);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("PENDING");
    expect(res.body.data.user).toBeDefined();
    // client cannot inject a different status
    const res2 = await createRequest(token, { status: "RESOLVED" });
    expect(res2.body.data.status).toBe("PENDING");
  });

  it("returns 401 without authentication", async () => {
    const res = await request(app)
      .post("/api/requests")
      .send({ title: "x", description: "y", category: "TECHNICAL", priority: "LOW" });
    expect(res.status).toBe(401);
  });

  it("validates required fields", async () => {
    const token = await createUserAndLogin("user2@example.com");
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "x" });
    expect(res.status).toBe(400);
  });
});

// ── List ──────────────────────────────────────────────────────────────────────

describe("GET /api/requests", () => {
  it("user sees only their own requests", async () => {
    const tokenA = await createUserAndLogin("a@example.com");
    const tokenB = await createUserAndLogin("b@example.com");
    await createRequest(tokenA);
    await createRequest(tokenA);
    await createRequest(tokenB);

    const res = await request(app)
      .get("/api/requests")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it("admin sees all requests", async () => {
    const tokenUser = await createUserAndLogin("user@example.com");
    const tokenAdmin = await createUserAndLogin("admin@example.com", UserRole.ADMIN);
    await createRequest(tokenUser);
    await createRequest(tokenUser);

    const res = await request(app)
      .get("/api/requests")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.meta).toBeDefined();
  });

  it("supports pagination meta", async () => {
    const token = await createUserAndLogin("pager@example.com");
    await createRequest(token);
    const res = await request(app)
      .get("/api/requests?page=1&limit=5")
      .set("Authorization", `Bearer ${token}`);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(5);
    expect(res.body.meta.total).toBeDefined();
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/requests");
    expect(res.status).toBe(401);
  });
});

// ── Get by ID ─────────────────────────────────────────────────────────────────

describe("GET /api/requests/:id", () => {
  it("user can access their own request", async () => {
    const token = await createUserAndLogin("owner@example.com");
    const created = await createRequest(token);
    const id = created.body.data._id;

    const res = await request(app)
      .get(`/api/requests/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  it("user cannot access another user's request", async () => {
    const tokenA = await createUserAndLogin("ownerA@example.com");
    const tokenB = await createUserAndLogin("ownerB@example.com");
    const created = await createRequest(tokenA);
    const id = created.body.data._id;

    const res = await request(app)
      .get(`/api/requests/${id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });

  it("admin can access any request", async () => {
    const tokenUser = await createUserAndLogin("user@example.com");
    const tokenAdmin = await createUserAndLogin("admin@example.com", UserRole.ADMIN);
    const created = await createRequest(tokenUser);
    const id = created.body.data._id;

    const res = await request(app)
      .get(`/api/requests/${id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
  });

  it("returns 404 for nonexistent ID", async () => {
    const token = await createUserAndLogin("admin2@example.com", UserRole.ADMIN);
    const res = await request(app)
      .get("/api/requests/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid ID format", async () => {
    const token = await createUserAndLogin("admin3@example.com", UserRole.ADMIN);
    const res = await request(app)
      .get("/api/requests/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});

// ── Update ────────────────────────────────────────────────────────────────────

describe("PUT /api/requests/:id", () => {
  it("owner can edit a PENDING request", async () => {
    const token = await createUserAndLogin("editor@example.com");
    const created = await createRequest(token);
    const id = created.body.data._id;

    const res = await request(app)
      .put(`/api/requests/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated title for the request" });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated title for the request");
  });

  it("non-owner cannot edit the request", async () => {
    const tokenA = await createUserAndLogin("ownerE@example.com");
    const tokenB = await createUserAndLogin("otherE@example.com");
    const created = await createRequest(tokenA);
    const id = created.body.data._id;

    const res = await request(app)
      .put(`/api/requests/${id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hacked title for the request" });
    expect(res.status).toBe(403);
  });

  it("cannot change status through update endpoint", async () => {
    const token = await createUserAndLogin("editor2@example.com");
    const created = await createRequest(token);
    const id = created.body.data._id;

    const res = await request(app)
      .put(`/api/requests/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "RESOLVED" });
    // Status must remain PENDING (field is ignored)
    expect(res.body.data.status).toBe("PENDING");
  });
});

// ── Cancel ────────────────────────────────────────────────────────────────────

describe("PATCH /api/requests/:id/cancel", () => {
  it("owner can cancel a PENDING request", async () => {
    const token = await createUserAndLogin("canceller@example.com");
    const created = await createRequest(token);
    const id = created.body.data._id;

    const res = await request(app)
      .patch(`/api/requests/${id}/cancel`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });

  it("cannot cancel an already-cancelled request", async () => {
    const token = await createUserAndLogin("canceller2@example.com");
    const created = await createRequest(token);
    const id = created.body.data._id;

    await request(app)
      .patch(`/api/requests/${id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/requests/${id}/cancel`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_STATUS_TRANSITION");
  });
});

// ── Admin status update ───────────────────────────────────────────────────────

describe("PATCH /api/requests/:id/status", () => {
  it("admin can update status through valid transitions", async () => {
    const tokenUser = await createUserAndLogin("suser@example.com");
    const tokenAdmin = await createUserAndLogin("sadmin@example.com", UserRole.ADMIN);
    const created = await createRequest(tokenUser);
    const id = created.body.data._id;

    const res = await request(app)
      .patch(`/api/requests/${id}/status`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ status: "IN_PROGRESS" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("IN_PROGRESS");
  });

  it("rejects invalid status transition", async () => {
    const tokenUser = await createUserAndLogin("suser2@example.com");
    const tokenAdmin = await createUserAndLogin("sadmin2@example.com", UserRole.ADMIN);
    const created = await createRequest(tokenUser);
    const id = created.body.data._id;

    // PENDING -> RESOLVED is invalid
    const res = await request(app)
      .patch(`/api/requests/${id}/status`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ status: "RESOLVED" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_STATUS_TRANSITION");
  });

  it("non-admin cannot update status", async () => {
    const token = await createUserAndLogin("plainuser@example.com");
    const created = await createRequest(token);
    const id = created.body.data._id;

    const res = await request(app)
      .patch(`/api/requests/${id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "IN_PROGRESS" });
    expect(res.status).toBe(403);
  });
});
