// Authentication helper functions

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
  };
}

export interface AuthError {
  success: false;
  message: string;
  field?: string;
}

// API Base URL - adjust this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },

  setToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  },

  removeToken: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken();
  },
};

// API call helper
async function apiCall<T>(
  endpoint: string,
  data: any,
  method: "POST" | "GET" | "PUT" | "DELETE" = "POST"
): Promise<T> {
  const token = tokenManager.getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: method !== "GET" ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Network error occurred",
    }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Authentication functions
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiCall<AuthResponse>(
        "/api/auth/login",
        credentials
      );

      if (response.success && response.token) {
        tokenManager.setToken(response.token);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiCall<AuthResponse>(
        "/api/auth/register",
        userData
      );

      if (response.success && response.token) {
        tokenManager.setToken(response.token);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      };
    }
  },

  logout: (): void => {
    tokenManager.removeToken();
    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const response = await apiCall<AuthResponse>("/api/auth/me", {}, "GET");
      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get user data",
      };
    }
  },
};

// Form validation helpers
export const validators = {
  email: (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  },

  name: (name: string): string | null => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return null;
  },

  confirmPassword: (
    password: string,
    confirmPassword: string
  ): string | null => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  },
};

// Navigation helpers
export const navigation = {
  redirectToDashboard: (role?: "admin" | "user"): void => {
    if (typeof window !== "undefined") {
      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "user") {
        window.location.href = "/user";
      } else {
        // Fallback to login if no role
        window.location.href = "/login";
      }
    }
  },

  redirectToLogin: (): void => {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  requireAuth: (): boolean => {
    if (!tokenManager.isAuthenticated()) {
      navigation.redirectToLogin();
      return false;
    }
    return true;
  },

  requireRole: (requiredRole: "admin" | "user"): boolean => {
    if (!tokenManager.isAuthenticated()) {
      navigation.redirectToLogin();
      return false;
    }

    // Get user role from token or API
    // For now, we'll handle this in the individual pages
    return true;
  },
};
