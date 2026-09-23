import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError.js";

type RequestPart = "body" | "query" | "params";

export function validate(schema: ZodSchema, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[part]);
      // Overwrite with coerced/transformed values
      (req as unknown as Record<string, unknown>)[part] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues: Array<{ path: unknown[]; message: string }> =
          (err.issues ?? []) as Array<{ path: unknown[]; message: string }>;
        const message = issues
          .map((e) => `${(e.path as (string | number | symbol)[]).join(".")}: ${e.message}`)
          .join(", ");
        next(new ApiError(400, message || err.message, "VALIDATION_ERROR"));
      } else {
        next(err);
      }
    }
  };
}
