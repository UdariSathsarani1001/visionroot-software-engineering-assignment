import api from "./api";
import {
  ServiceRequest,
  CreateRequestInput,
  UpdateRequestInput,
  RequestFilters,
  RequestStatus,
} from "@/types/request";
import { ApiSuccessResponse, ApiListResponse, PaginationMeta } from "@/types/api";

export interface RequestsResult {
  data: ServiceRequest[];
  meta: PaginationMeta;
}

export const requestService = {
  async getRequests(params?: RequestFilters): Promise<RequestsResult> {
    // Remove empty string values so they don't pollute query strings
    const cleanParams: Record<string, string | number> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== "" && v !== undefined && v !== null) {
          cleanParams[k] = v as string | number;
        }
      }
    }
    const res = await api.get<ApiListResponse<ServiceRequest>>("/requests", { params: cleanParams });
    return { data: res.data.data, meta: res.data.meta };
  },

  async getRequestById(id: string): Promise<ServiceRequest> {
    const res = await api.get<ApiSuccessResponse<ServiceRequest>>(`/requests/${id}`);
    return res.data.data;
  },

  async createRequest(input: CreateRequestInput): Promise<ServiceRequest> {
    const res = await api.post<ApiSuccessResponse<ServiceRequest>>("/requests", input);
    return res.data.data;
  },

  async updateRequest(id: string, input: UpdateRequestInput): Promise<ServiceRequest> {
    const res = await api.put<ApiSuccessResponse<ServiceRequest>>(`/requests/${id}`, input);
    return res.data.data;
  },

  async cancelRequest(id: string): Promise<ServiceRequest> {
    const res = await api.patch<ApiSuccessResponse<ServiceRequest>>(`/requests/${id}/cancel`);
    return res.data.data;
  },

  async updateRequestStatus(id: string, status: RequestStatus): Promise<ServiceRequest> {
    const res = await api.patch<ApiSuccessResponse<ServiceRequest>>(`/requests/${id}/status`, { status });
    return res.data.data;
  },
};
