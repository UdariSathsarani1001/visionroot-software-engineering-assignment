import axios, { AxiosError } from "axios";

export interface FrontendError {
  code: string;
  message: string;
  status?: number;
}

// ── In-memory token store ─────────────────────────────────────────────────────
// Stored in memory so it survives navigation but doesn't persist across hard
// refreshes. On refresh the AuthProvider calls GET /api/auth/me with the
// httpOnly refresh cookie to silently restore the session.
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ── Axios instance ────────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // needed to send/receive the httpOnly refresh cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token to every outgoing request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

// Normalize error responses
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: false; error: { code: string; message: string } }>) => {
    const apiError: FrontendError = {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred.",
    };

    if (error.response) {
      apiError.status = error.response.status;
      const body = error.response.data;
      if (body && !body.success && body.error) {
        apiError.code = body.error.code;
        apiError.message = body.error.message;
      } else {
        switch (error.response.status) {
          case 400:
            apiError.code = "BAD_REQUEST";
            apiError.message = "Invalid request.";
            break;
          case 401:
            apiError.code = "UNAUTHORIZED";
            apiError.message = "You must be logged in.";
            break;
          case 403:
            apiError.code = "FORBIDDEN";
            apiError.message = "You do not have permission.";
            break;
          case 404:
            apiError.code = "NOT_FOUND";
            apiError.message = "Resource not found.";
            break;
          case 409:
            apiError.code = "CONFLICT";
            apiError.message = "A conflict occurred.";
            break;
          default:
            apiError.code = "SERVER_ERROR";
            apiError.message = "A server error occurred. Please try again.";
        }
      }
    } else if (error.request) {
      apiError.code = "NETWORK_ERROR";
      apiError.message = "Cannot connect to the server. Check your network.";
    }

    return Promise.reject(apiError);
  }
);

export default api;
