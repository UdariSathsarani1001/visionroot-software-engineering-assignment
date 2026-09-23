import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { sendSuccess, sendCreated } from "../utils/ApiResponse.js";
import { env } from "../config/env.js";

const REFRESH_COOKIE = "refreshToken";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.registerUser(req.body);
    sendCreated(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(
      req.body
    );
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
    sendSuccess(res, { user, accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
    await authService.logoutUser(refreshToken);
    res.clearCookie(REFRESH_COOKIE);
    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
}

export function me(req: Request, res: Response): void {
  sendSuccess(res, { user: req.user });
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
    const { user, accessToken } = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, { user, accessToken });
  } catch (err) {
    next(err);
  }
}
