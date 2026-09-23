import { RequestCategory, RequestPriority, RequestStatus } from "@/types/request";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CANCELLED: "Cancelled",
};

export const REQUEST_PRIORITY_LABELS: Record<RequestPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const REQUEST_CATEGORY_LABELS: Record<RequestCategory, string> = {
  TECHNICAL: "Technical",
  BILLING: "Billing",
  ACCOUNT: "Account",
  OTHER: "Other",
};

export const STATUS_OPTIONS = (Object.keys(REQUEST_STATUS_LABELS) as RequestStatus[]).map(
  (v) => ({ label: REQUEST_STATUS_LABELS[v], value: v })
);

export const PRIORITY_OPTIONS = (Object.keys(REQUEST_PRIORITY_LABELS) as RequestPriority[]).map(
  (v) => ({ label: REQUEST_PRIORITY_LABELS[v], value: v })
);

export const CATEGORY_OPTIONS = (Object.keys(REQUEST_CATEGORY_LABELS) as RequestCategory[]).map(
  (v) => ({ label: REQUEST_CATEGORY_LABELS[v], value: v })
);

// Valid admin status transitions
export const ADMIN_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: [],
  CANCELLED: [],
};

export const DEFAULT_PAGE_SIZE = 10;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  REQUESTS: "/requests",
  NEW_REQUEST: "/requests/new",
  REQUEST_DETAILS: (id: string) => `/requests/${id}`,
  EDIT_REQUEST: (id: string) => `/requests/${id}/edit`,
  ADMIN: "/admin",
  ADMIN_REQUESTS: "/admin/requests",
  ADMIN_USERS: "/admin/users",
} as const;
