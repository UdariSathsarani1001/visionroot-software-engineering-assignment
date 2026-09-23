import mongoose from "mongoose";
import ServiceRequest from "../models/ServiceRequest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination, buildMeta } from "../utils/pagination.js";
import { canTransition } from "./request-status.service.js";
import {
  RequestStatus,
  RequestCategory,
  RequestPriority,
  CANCELABLE_STATUSES,
  UserRole,
} from "../constants/request.constants.js";
import type {
  CreateRequestInput,
  UpdateRequestInput,
  RequestQueryInput,
} from "../validators/request.validator.js";
import type { AuthenticatedUser } from "../middleware/auth.middleware.js";

export async function createRequest(
  input: CreateRequestInput,
  user: AuthenticatedUser
) {
  const request = await ServiceRequest.create({
    user: new mongoose.Types.ObjectId(user.id),
    title: input.title,
    description: input.description,
    category: input.category as RequestCategory,
    priority: input.priority as RequestPriority,
    status: RequestStatus.PENDING,
  });
  return request;
}

export async function getRequests(
  query: RequestQueryInput,
  user: AuthenticatedUser
) {
  const { page, limit, search, status, category, priority, sortBy, sortOrder } =
    query;

  // Build filter
  const filter: Record<string, unknown> = {};

  // Users see only their own requests; admins see all
  if (user.role !== UserRole.ADMIN) {
    filter["user"] = new mongoose.Types.ObjectId(user.id);
  }

  if (status) filter["status"] = status;
  if (category) filter["category"] = category;
  if (priority) filter["priority"] = priority;

  if (search) {
    filter["$text"] = { $search: search };
  }

  const { skip } = parsePagination({ page, limit });
  const sort: Record<string, 1 | -1> = {
    [sortBy ?? "createdAt"]: sortOrder === "asc" ? 1 : -1,
  };

  const [data, total] = await Promise.all([
    ServiceRequest.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    ServiceRequest.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
}

export async function getRequestById(
  id: string,
  user: AuthenticatedUser
) {
  const request = await ServiceRequest.findById(id).lean();
  if (!request) throw ApiError.notFound("Request not found");

  if (
    user.role !== UserRole.ADMIN &&
    request.user.toString() !== user.id
  ) {
    throw ApiError.forbidden("Access denied");
  }

  return request;
}

export async function updateRequest(
  id: string,
  input: UpdateRequestInput,
  user: AuthenticatedUser
) {
  const request = await ServiceRequest.findById(id);
  if (!request) throw ApiError.notFound("Request not found");

  if (request.user.toString() !== user.id) {
    throw ApiError.forbidden("You can only edit your own requests");
  }
  if (request.status !== RequestStatus.PENDING) {
    throw ApiError.badRequest(
      "Only PENDING requests can be edited",
      "INVALID_STATUS"
    );
  }

  // Only update allowed fields
  if (input.title !== undefined) request.title = input.title;
  if (input.description !== undefined) request.description = input.description;
  if (input.category !== undefined) request.category = input.category as typeof request.category;
  if (input.priority !== undefined) request.priority = input.priority as typeof request.priority;

  await request.save();
  return request;
}

export async function cancelRequest(
  id: string,
  user: AuthenticatedUser
) {
  const request = await ServiceRequest.findById(id);
  if (!request) throw ApiError.notFound("Request not found");

  // Users can cancel their own; admins can cancel any
  if (
    user.role !== UserRole.ADMIN &&
    request.user.toString() !== user.id
  ) {
    throw ApiError.forbidden("Access denied");
  }

  if (!CANCELABLE_STATUSES.includes(request.status)) {
    throw ApiError.badRequest(
      `Cannot cancel a request with status: ${request.status}`,
      "INVALID_STATUS_TRANSITION"
    );
  }

  request.status = RequestStatus.CANCELLED;
  await request.save();
  return request;
}

export async function updateRequestStatus(
  id: string,
  targetStatus: RequestStatus
) {
  const request = await ServiceRequest.findById(id);
  if (!request) throw ApiError.notFound("Request not found");

  if (!canTransition(request.status, targetStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from ${request.status} to ${targetStatus}`,
      "INVALID_STATUS_TRANSITION"
    );
  }

  request.status = targetStatus;
  await request.save();
  return request;
}
