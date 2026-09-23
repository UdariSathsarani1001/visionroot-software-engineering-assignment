import api from "./api";
import { User, UserFilters } from "@/types/user";
import { ApiListResponse, PaginationMeta } from "@/types/api";

export interface UsersResult {
  data: User[];
  meta: PaginationMeta;
}

export const userService = {
  async getUsers(params?: UserFilters): Promise<UsersResult> {
    const cleanParams: Record<string, string | number> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== "" && v !== undefined && v !== null) {
          cleanParams[k] = v as string | number;
        }
      }
    }
    const res = await api.get<ApiListResponse<User>>("/users", { params: cleanParams });
    return { data: res.data.data, meta: res.data.meta };
  },
};
