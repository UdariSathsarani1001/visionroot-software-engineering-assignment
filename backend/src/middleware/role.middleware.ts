import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { UserRole } from "../constants/request.constants.js";

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
}
