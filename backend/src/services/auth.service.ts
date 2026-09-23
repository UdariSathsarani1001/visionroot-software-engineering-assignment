import bcrypt from "bcryptjs";
import crypto from "crypto";
import ms from "ms";
import User, { toSafeUser } from "../models/User.model.js";
import RefreshToken from "../models/RefreshToken.model.js";
import { ApiError } from "../utils/ApiError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { env } from "../config/env.js";
import type { RegisterInput, LoginInput } from "../validators/auth.validator.js";
import { UserRole } from "../constants/request.constants.js";

const SALT_ROUNDS = 12;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function msToDate(duration: string): Date {
  const milliseconds = ms(duration as ms.StringValue);
  return new Date(Date.now() + milliseconds);
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict("Email is already in use");
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    role: UserRole.USER, // always USER on registration
  });

  return toSafeUser(user);
}

export async function loginUser(input: LoginInput) {
  // Explicitly select password since it's excluded by default
  const user = await User.findOne({ email: input.email }).select("+password");

  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }
  if (!user.isActive) {
    throw ApiError.unauthorized("Account is inactive");
  }

  const passwordMatch = await bcrypt.compare(input.password, user.password);
  if (!passwordMatch) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });

  // Generate refresh token, store its hash
  const tokenId = crypto.randomUUID();
  const refreshToken = signRefreshToken({
    userId: user._id.toString(),
    tokenId,
  });

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: msToDate(env.REFRESH_TOKEN_EXPIRES_IN),
  });

  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function logoutUser(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;

  const tokenHash = hashToken(refreshToken);
  await RefreshToken.findOneAndUpdate(
    { tokenHash, revokedAt: null },
    { revokedAt: new Date() }
  );
}

export async function refreshAccessToken(refreshToken: string | undefined) {
  if (!refreshToken) {
    throw ApiError.unauthorized("No refresh token provided");
  }

  const payload = verifyRefreshToken(refreshToken);

  const tokenHash = hashToken(refreshToken);
  const storedToken = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!storedToken) {
    throw ApiError.unauthorized("Refresh token is invalid or expired");
  }

  const user = await User.findById(payload.userId).select("_id name email role isActive");
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User not found or inactive");
  }

  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });

  return { user: toSafeUser(user), accessToken };
}
