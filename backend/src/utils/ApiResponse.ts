import type { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ success: true, data });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta
): void {
  res.status(200).json({ success: true, data, meta });
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}
