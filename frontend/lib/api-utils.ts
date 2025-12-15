// Shared API utilities with auto-refresh token support

import { tokenManager } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Refresh token helper
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.accessToken) {
      tokenManager.setToken(data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

// API call helper with auto-refresh on 401/403
export async function apiCallWithRefresh<T>(
  endpoint: string,
  options: RequestInit = {},
  retryOnAuth = true
): Promise<Response> {
  const token = tokenManager.getToken();

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Handle 401/403 with auto-refresh
  if ((response.status === 401 || response.status === 403) && retryOnAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry the original request with new token
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
      });
    } else {
      // Refresh failed, logout user
      tokenManager.removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
}

