export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum RequestStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CANCELLED = "CANCELLED",
}

export enum RequestCategory {
  TECHNICAL = "TECHNICAL",
  BILLING = "BILLING",
  ACCOUNT = "ACCOUNT",
  OTHER = "OTHER",
}

export enum RequestPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

/** Valid status transitions: key → allowed next statuses */
export const STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.PENDING]: [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
  [RequestStatus.IN_PROGRESS]: [RequestStatus.RESOLVED, RequestStatus.CANCELLED],
  [RequestStatus.RESOLVED]: [],
  [RequestStatus.CANCELLED]: [],
};

export const CANCELABLE_STATUSES: RequestStatus[] = [
  RequestStatus.PENDING,
  RequestStatus.IN_PROGRESS,
];
