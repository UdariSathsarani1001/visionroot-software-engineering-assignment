export type RequestStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";
export type RequestPriority = "LOW" | "MEDIUM" | "HIGH";
export type RequestCategory = "TECHNICAL" | "BILLING" | "ACCOUNT" | "OTHER";

export interface RequestUser {
  _id: string;
  name: string;
  email: string;
}

export interface ServiceRequest {
  _id: string;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  user: RequestUser;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestInput {
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
}

export interface UpdateRequestInput {
  title?: string;
  description?: string;
  category?: RequestCategory;
  priority?: RequestPriority;
}

export interface RequestFilters {
  search?: string;
  status?: RequestStatus | "";
  category?: RequestCategory | "";
  priority?: RequestPriority | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
