import api, { setAccessToken } from "./api";
import { AuthUser, LoginInput, RegisterInput } from "@/types/auth";
import { ApiSuccessResponse } from "@/types/api";

export const authService = {
  async register(input: RegisterInput): Promise<{ user: AuthUser }> {
    const res = await api.post<ApiSuccessResponse<{ user: AuthUser }>>("/auth/register", input);
    return res.data.data;
  },

  async login(input: LoginInput): Promise<{ user: AuthUser }> {
    const res = await api.post<ApiSuccessResponse<{ user: AuthUser; accessToken: string }>>(
      "/auth/login",
      input
    );
    const { user, accessToken } = res.data.data;
    // Store the token so all subsequent requests carry the Authorization header
    setAccessToken(accessToken);
    return { user };
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
    }
  },

  /**
   * Called on page load to silently restore the session using the httpOnly
   * refresh cookie. Returns the user if the cookie is valid, throws otherwise.
   */
  async restoreSession(): Promise<AuthUser> {
    const res = await api.post<ApiSuccessResponse<{ user: AuthUser; accessToken: string }>>(
      "/auth/refresh"
    );
    const { user, accessToken } = res.data.data;
    setAccessToken(accessToken);
    return user;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const res = await api.get<ApiSuccessResponse<{ user: AuthUser }>>("/auth/me");
    return res.data.data.user;
  },
};
