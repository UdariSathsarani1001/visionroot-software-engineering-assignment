import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";
import User, { type IUser } from "../models/User.model.js";
import { UserRole } from "../constants/request.constants.js";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No access token provided");
    }
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId).select(
      "_id name email role isActive"
    );

    if (!user) {
      throw ApiError.unauthorized("User not found");
    }
    if (!(user as IUser).isActive) {
      throw ApiError.unauthorized("Account is inactive");
    }

    req.user = {
      id: (user as IUser)._id.toString(),
      name: (user as IUser).name,
      email: (user as IUser).email,
      role: (user as IUser).role,
    };

    next();
  } catch (err) {
    next(err);
  }
}
