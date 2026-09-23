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

describe("GET /api/users", () => {
  it("admin can list users with safe fields only", async () => {
    await createUserAndLogin("regular@example.com");
    const adminToken = await createUserAndLogin("admin@example.com", UserRole.ADMIN);

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    const user = res.body.data[0];
    expect(user.password).toBeUndefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.role).toBeDefined();
    expect(user.createdAt).toBeDefined();
  });

  it("non-admin cannot access user list", async () => {
    const token = await createUserAndLogin("user@example.com");
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("unauthenticated request returns 401", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  it("supports pagination", async () => {
    const adminToken = await createUserAndLogin("admin2@example.com", UserRole.ADMIN);
    const res = await request(app)
      .get("/api/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
  });
});
