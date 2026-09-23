import { ApiError } from "../../src/utils/ApiError";

describe("ApiError", () => {
  it("creates a 400 bad-request error", () => {
    const err = ApiError.badRequest("Invalid input");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Invalid input");
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(Error);
  });

  it("creates a 401 unauthorized error", () => {
    const err = ApiError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("creates a 403 forbidden error", () => {
    const err = ApiError.forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });

  it("creates a 404 not-found error", () => {
    const err = ApiError.notFound("User not found");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("User not found");
  });

  it("creates a 409 conflict error", () => {
    const err = ApiError.conflict("Email already exists");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it("creates a 500 internal error", () => {
    const err = ApiError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("supports a custom code", () => {
    const err = new ApiError(400, "Oops", "CUSTOM_CODE");
    expect(err.code).toBe("CUSTOM_CODE");
  });
});
