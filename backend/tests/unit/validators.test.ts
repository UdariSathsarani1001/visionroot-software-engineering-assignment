import { registerSchema, loginSchema } from "../../src/validators/auth.validator";
import {
  createRequestSchema,
  updateRequestSchema,
  updateStatusSchema,
  mongoIdSchema,
} from "../../src/validators/request.validator";

describe("registerSchema", () => {
  const valid = { name: "Alice", email: "alice@example.com", password: "secret123" };

  it("accepts valid input", () => {
    expect(() => registerSchema.parse(valid)).not.toThrow();
  });

  it("rejects missing name", () => {
    expect(() => registerSchema.parse({ ...valid, name: "" })).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() => registerSchema.parse({ ...valid, email: "not-an-email" })).toThrow();
  });

  it("rejects short password", () => {
    expect(() => registerSchema.parse({ ...valid, password: "abc" })).toThrow();
  });

  it("normalises email to lowercase", () => {
    const result = registerSchema.parse({ ...valid, email: "ALICE@EXAMPLE.COM" });
    expect(result.email).toBe("alice@example.com");
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(() =>
      loginSchema.parse({ email: "bob@example.com", password: "pass" })
    ).not.toThrow();
  });

  it("rejects missing password", () => {
    expect(() => loginSchema.parse({ email: "bob@example.com" })).toThrow();
  });
});

describe("createRequestSchema", () => {
  const valid = {
    title: "Fix the login bug",
    description: "The login button does not work on mobile devices.",
    category: "TECHNICAL",
    priority: "HIGH",
  };

  it("accepts valid input", () => {
    expect(() => createRequestSchema.parse(valid)).not.toThrow();
  });

  it("rejects invalid category", () => {
    expect(() => createRequestSchema.parse({ ...valid, category: "UNKNOWN" })).toThrow();
  });

  it("rejects invalid priority", () => {
    expect(() => createRequestSchema.parse({ ...valid, priority: "CRITICAL" })).toThrow();
  });

  it("rejects short title", () => {
    expect(() => createRequestSchema.parse({ ...valid, title: "ab" })).toThrow();
  });

  it("rejects short description", () => {
    expect(() => createRequestSchema.parse({ ...valid, description: "short" })).toThrow();
  });
});

describe("updateRequestSchema", () => {
  it("allows partial updates", () => {
    expect(() => updateRequestSchema.parse({ title: "New title here" })).not.toThrow();
  });

  it("allows empty object (no fields to update)", () => {
    expect(() => updateRequestSchema.parse({})).not.toThrow();
  });
});

describe("updateStatusSchema", () => {
  it("accepts valid statuses", () => {
    for (const status of ["PENDING", "IN_PROGRESS", "RESOLVED", "CANCELLED"]) {
      expect(() => updateStatusSchema.parse({ status })).not.toThrow();
    }
  });

  it("rejects invalid status", () => {
    expect(() => updateStatusSchema.parse({ status: "DONE" })).toThrow();
  });
});

describe("mongoIdSchema", () => {
  it("accepts a valid 24-char hex id", () => {
    expect(() =>
      mongoIdSchema.parse({ id: "507f1f77bcf86cd799439011" })
    ).not.toThrow();
  });

  it("rejects invalid id", () => {
    expect(() => mongoIdSchema.parse({ id: "not-an-id" })).toThrow();
    expect(() => mongoIdSchema.parse({ id: "123" })).toThrow();
  });
});
