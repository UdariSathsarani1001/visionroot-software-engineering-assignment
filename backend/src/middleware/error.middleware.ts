import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Mongoose duplicate key
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  ) {
    res.status(409).json({
      success: false,
      error: {
        code: "CONFLICT",
        message: "A record with that value already exists",
      },
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: string }).name === "CastError"
  ) {
    res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid ID format",
      },
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
