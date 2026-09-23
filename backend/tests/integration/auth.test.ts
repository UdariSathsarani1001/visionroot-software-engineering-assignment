import request from "supertest";
import app from "../../src/app";
import { connectTestDB, clearCollections, disconnectTestDB } from "./helpers/db";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearCollections();
});

afterAll(async () => {
  await disconnectTestDB();
});

const REGISTER_URL = "/api/auth/register";
const LOGIN_URL = "/api/auth/login";
const LOGOUT_URL = "/api/auth/logout";
const ME_URL = "/api/auth/me";

const validUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};

describe("POST /api/auth/register", () => {
  it("registers a new user and returns safe user data", async () => {
    const res = await request(app).post(REGISTER_URL).send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.role).toBe("USER");
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("rejects duplicate email with 409", async () => {
    await request(app).post(REGISTER_URL).send(validUser);
    const res = await request(app).post(REGISTER_URL).send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("validates required fields", async () => {
    const res = await request(app).post(REGISTER_URL).send({ email: "bad" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects weak password", async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ ...validUser, password: "abc" });
    expect(res.status).toBe(400);
  });

  it("cannot register as ADMIN", async () => {
    const res = await request(app)
      .post(REGISTER_URL)
      .send({ ...validUser, role: "ADMIN" });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe("USER");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post(REGISTER_URL).send(validUser);
  });

  it("logs in with valid credentials", async () => {
    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
    // refresh token should be set as httpOnly cookie
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects wrong password with 401", async () => {
    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: validUser.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("rejects unknown email with 401", async () => {
    const res = await request(app)
      .post(LOGIN_URL)
      .send({ email: "nobody@example.com", password: "password123" });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the refresh cookie", async () => {
    await request(app).post(REGISTER_URL).send(validUser);
    const loginRes = await request(app)
      .post(LOGIN_URL)
      .send({ email: validUser.email, password: validUser.password });

    const cookies = loginRes.headers["set-cookie"] as unknown as string[];
    const res = await request(app)
      .post(LOGOUT_URL)
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
  });

  it("is idempotent — safe to call without a cookie", async () => {
    const res = await request(app).post(LOGOUT_URL);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the authenticated user", async () => {
    await request(app).post(REGISTER_URL).send(validUser);
    const loginRes = await request(app)
      .post(LOGIN_URL)
      .send({ email: validUser.email, password: validUser.password });
    const { accessToken } = loginRes.body.data;

    const res = await request(app)
      .get(ME_URL)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get(ME_URL);
    expect(res.status).toBe(401);
  });

  it("returns 401 with a tampered token", async () => {
    const res = await request(app)
      .get(ME_URL)
      .set("Authorization", "Bearer tampered.token.value");
    expect(res.status).toBe(401);
  });
});
