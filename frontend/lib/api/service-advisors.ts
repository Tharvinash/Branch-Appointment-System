/**
 * Service Advisor API Helper
 * Handles all service advisor-related API calls and data management
 */

import { tokenManager } from "@/lib/auth";

// Base API URL - adjust based on your backend configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Types
export interface ServiceAdvisor {
  id: number;
  name: string;
  status: "AVAILABLE" | "ON_LEAVE";
}

export interface CreateServiceAdvisorData {
  name: string;
  status: "AVAILABLE" | "ON_LEAVE";
}

export interface UpdateServiceAdvisorData {
  name: string;
  status: "AVAILABLE" | "ON_LEAVE";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Helper Functions
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = tokenManager.getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `HTTP error! status: ${response.status}`,
        error: data.error,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: "Network error occurred",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Service Advisor API Functions
export const serviceAdvisorAPI = {
  // Get all service advisors
  getAllServiceAdvisors: async (): Promise<ApiResponse<ServiceAdvisor[]>> => {
    return apiCall<ServiceAdvisor[]>("/service-advisors");
  },

  // Get service advisor by ID
  getServiceAdvisorById: async (
    id: number
  ): Promise<ApiResponse<ServiceAdvisor>> => {
    return apiCall<ServiceAdvisor>(`/service-advisors/${id}`);
  },

  // Create new service advisor
  createServiceAdvisor: async (
    data: CreateServiceAdvisorData
  ): Promise<ApiResponse<ServiceAdvisor>> => {
    return apiCall<ServiceAdvisor>("/service-advisors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update service advisor
  updateServiceAdvisor: async (
    id: number,
    data: UpdateServiceAdvisorData
  ): Promise<ApiResponse<ServiceAdvisor>> => {
    return apiCall<ServiceAdvisor>(`/service-advisors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete service advisor
  deleteServiceAdvisor: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/service-advisors/${id}`, {
      method: "DELETE",
    });
  },
};

// Validation Functions
export const serviceAdvisorValidators = {
  name: (name: string): string | null => {
    if (!name || name.trim().length === 0) {
      return "Service advisor name is required";
    }
    if (name.trim().length < 2) {
      return "Service advisor name must be at least 2 characters";
    }
    if (name.trim().length > 100) {
      return "Service advisor name must be less than 100 characters";
    }
    return null;
  },

  status: (status: string): string | null => {
    if (!status) {
      return "Service advisor status is required";
    }
    if (!["AVAILABLE", "ON_LEAVE"].includes(status)) {
      return "Service advisor status must be either 'AVAILABLE' or 'ON_LEAVE'";
    }
    return null;
  },
};

// Utility Functions
export const serviceAdvisorUtils = {
  // Sort service advisors by name
  sortServiceAdvisors: (
    serviceAdvisors: ServiceAdvisor[]
  ): ServiceAdvisor[] => {
    return [...serviceAdvisors].sort((a, b) => a.name.localeCompare(b.name));
  },

  // Filter service advisors by status
  filterByStatus: (
    serviceAdvisors: ServiceAdvisor[],
    status: "AVAILABLE" | "ON_LEAVE"
  ): ServiceAdvisor[] => {
    return serviceAdvisors.filter(
      (serviceAdvisor) => serviceAdvisor.status === status
    );
  },

  // Search service advisors by name
  searchServiceAdvisors: (
    serviceAdvisors: ServiceAdvisor[],
    query: string
  ): ServiceAdvisor[] => {
    if (!query.trim()) return serviceAdvisors;

    const searchQuery = query.toLowerCase().trim();
    return serviceAdvisors.filter(
      (serviceAdvisor) =>
        serviceAdvisor.name.toLowerCase().includes(searchQuery) ||
        serviceAdvisor.id.toString().includes(searchQuery)
    );
  },

  // Format status for display
  formatStatus: (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return {
          text: "Available",
          className:
            "inline-flex items-center px-2 py-2 rounded-full text-xs font-medium bg-green-100 text-green-800",
        };
      case "ON_LEAVE":
        return {
          text: "On Leave",
          className:
            "inline-flex items-center px-2 py-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
        };
      default:
        return {
          text: "Unknown",
          className:
            "inline-flex items-center px-2 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-800",
        };
    }
  },

  // Get service advisor statistics
  getStatistics: (serviceAdvisors: ServiceAdvisor[]) => {
    const total = serviceAdvisors.length;
    const available = serviceAdvisors.filter(
      (s) => s.status === "AVAILABLE"
    ).length;
    const onLeave = serviceAdvisors.filter(
      (s) => s.status === "ON_LEAVE"
    ).length;

    return {
      total,
      available,
      onLeave,
      availablePercentage:
        total > 0 ? Math.round((available / total) * 100) : 0,
    };
  },
};
