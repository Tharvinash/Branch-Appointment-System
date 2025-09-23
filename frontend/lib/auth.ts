// Authentication helper functions

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: number; // 0 = admin, 1 = technician, 2 = service advisor
}

export interface LoginResponse {
  accessToken: string;
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
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

// JWT Token payload interface
export interface JWTPayload {
  sub: string;
  id: number;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

// API Base URL - adjust this to match your backend
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// JWT Token decoding function
function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token format");
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Add padding if needed for base64 decoding
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    // Decode base64
    const decodedPayload = atob(paddedPayload);

    // Parse JSON
    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
}

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

  isTokenExpired: (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  },

  getTokenPayload: (): JWTPayload | null => {
    const token = tokenManager.getToken();
    if (!token) return null;
    return decodeJWT(token);
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
      const response = await apiCall<LoginResponse>("/auth/login", credentials);

      if (response.accessToken) {
        tokenManager.setToken(response.accessToken);

        // Map backend role to frontend role
        const frontendRole = response.role === "ADMIN" ? "admin" : "user";

        return {
          success: true,
          token: response.accessToken,
          message: "Login successful",
          user: {
            id: response.userId.toString(),
            name: response.name,
            email: response.email,
            role: frontendRole,
          },
        };
      }

      return {
        success: false,
        message: "Login failed - no token received",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiCall<RegisterResponse>(
        "/auth/register",
        userData
      );

      return {
        success: true,
        message: response.message || "Registration successful",
      };
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
      // Get the stored token
      const token = tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: "No authentication token found",
        };
      }

      // Check if token is expired
      if (tokenManager.isTokenExpired(token)) {
        tokenManager.removeToken();
        return {
          success: false,
          message: "Token has expired. Please login again.",
        };
      }

      // Decode JWT token to get user info
      const payload = tokenManager.getTokenPayload();
      if (!payload) {
        return {
          success: false,
          message: "Invalid token format",
        };
      }

      // Map backend role to frontend role
      const frontendRole = payload.role === "ADMIN" ? "admin" : "user";

      return {
        success: true,
        token: token,
        message: "User data retrieved successfully",
        user: {
          id: payload.id.toString(),
          name: payload.name,
          email: payload.sub, // 'sub' field contains the email
          role: frontendRole,
        },
      };
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

    // Get user role from token
    const payload = tokenManager.getTokenPayload();
    if (!payload) {
      navigation.redirectToLogin();
      return false;
    }

    const userRole = payload.role === "ADMIN" ? "admin" : "user";
    return userRole === requiredRole;
  },
};
