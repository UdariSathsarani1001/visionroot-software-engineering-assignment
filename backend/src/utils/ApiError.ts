export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code ?? httpCodeToErrorCode(statusCode);
    // Maintains proper prototype chain in transpiled JS
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, code = "BAD_REQUEST"): ApiError {
    return new ApiError(400, message, code);
  }

  static unauthorized(message = "Unauthorized"): ApiError {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden"): ApiError {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(message = "Not found"): ApiError {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, "CONFLICT");
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(500, message, "INTERNAL_SERVER_ERROR");
  }
}

function httpCodeToErrorCode(status: number): string {
  const map: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "UNPROCESSABLE_ENTITY",
    500: "INTERNAL_SERVER_ERROR",
  };
  return map[status] ?? "ERROR";
}
