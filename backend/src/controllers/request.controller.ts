import type { Request, Response, NextFunction } from "express";
import * as requestService from "../services/request.service.js";
import {
  sendCreated,
  sendSuccess,
  sendPaginated,
} from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import type { RequestStatus } from "../constants/request.constants.js";

function getParam(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0]! : (val ?? "");
}

export async function createRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next(ApiError.unauthorized());
    const request = await requestService.createRequest(req.body, req.user);
    sendCreated(res, request);
  } catch (err) {
    next(err);
  }
}

export async function getRequests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next(ApiError.unauthorized());
    const { data, meta } = await requestService.getRequests(req.query as never, req.user);
    sendPaginated(res, data, meta);
  } catch (err) {
    next(err);
  }
}

export async function getRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next(ApiError.unauthorized());
    const request = await requestService.getRequestById(getParam(req, "id"), req.user);
    sendSuccess(res, request);
  } catch (err) {
    next(err);
  }
}

export async function updateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next(ApiError.unauthorized());
    const request = await requestService.updateRequest(
      getParam(req, "id"),
      req.body,
      req.user
    );
    sendSuccess(res, request);
  } catch (err) {
    next(err);
  }
}

export async function cancelRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next(ApiError.unauthorized());
    const request = await requestService.cancelRequest(getParam(req, "id"), req.user);
    sendSuccess(res, request);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = await requestService.updateRequestStatus(
      getParam(req, "id"),
      req.body.status as RequestStatus
    );
    sendSuccess(res, request);
  } catch (err) {
    next(err);
  }
}
