import { z } from "zod";
import {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../constants/request.constants.js";

const categories = Object.values(RequestCategory) as [string, ...string[]];
const priorities = Object.values(RequestPriority) as [string, ...string[]];
const statuses = Object.values(RequestStatus) as [string, ...string[]];

export const createRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  category: z.enum(categories, {
    error: `Category must be one of: ${categories.join(", ")}`,
  }),
  priority: z.enum(priorities, {
    error: `Priority must be one of: ${priorities.join(", ")}`,
  }),
});

export const updateRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
  category: z.enum(categories).optional(),
  priority: z.enum(priorities).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(statuses, {
    error: `Status must be one of: ${statuses.join(", ")}`,
  }),
});

const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "priority", "status"];
const SORT_ORDERS = ["asc", "desc"] as const;

export const requestQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(z.number().int().min(1).max(100)),
  search: z.string().max(200).optional(),
  status: z.enum(statuses).optional(),
  category: z.enum(categories).optional(),
  priority: z.enum(priorities).optional(),
  sortBy: z
    .string()
    .refine((v) => ALLOWED_SORT_FIELDS.includes(v), {
      message: `sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(", ")}`,
    })
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(SORT_ORDERS).optional().default("desc"),
});

export const mongoIdSchema = z.object({
  id: z.string().refine((v) => /^[a-f\d]{24}$/i.test(v), {
    message: "Invalid ID format",
  }),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type RequestQueryInput = z.infer<typeof requestQuerySchema>;
