import type { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service.js";
import { sendPaginated } from "../utils/ApiResponse.js";

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data, meta } = await userService.getUsers(req.query);
    sendPaginated(res, data, meta);
  } catch (err) {
    next(err);
  }
}
