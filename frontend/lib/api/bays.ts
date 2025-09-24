// Bay management API functions

import { tokenManager } from "@/lib/auth";

export interface Bay {
  id: number;
  name: string;
  number: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CreateBayData {
  name: string;
  number: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface UpdateBayData {
  name: string;
  number: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// API call helper
async function apiCall<T>(
  endpoint: string,
  data?: any,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
): Promise<ApiResponse<T>> {
  const token = tokenManager.getToken();

  if (!token) {
    return {
      success: false,
      message: "Authentication required",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (response.status === 204) {
      return { success: true } as ApiResponse<T>; // no body to parse
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      return {
        success: false,
        message: errorData.message || `HTTP ${response.status}`,
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

// Bay API functions
export const bayAPI = {
  // Get all bays
  getAllBays: async (): Promise<ApiResponse<Bay[]>> => {
    return apiCall<Bay[]>("/bays");
  },

  // Get bay by ID
  getBayById: async (bayId: number): Promise<ApiResponse<Bay>> => {
    return apiCall<Bay>(`/bays/${bayId}`);
  },

  // Create new bay
  createBay: async (bayData: CreateBayData): Promise<ApiResponse<Bay>> => {
    return apiCall<Bay>("/bays", bayData, "POST");
  },

  // Update bay
  updateBay: async (
    bayId: number,
    bayData: UpdateBayData,
  ): Promise<ApiResponse<Bay>> => {
    return apiCall<Bay>(`/bays/${bayId}`, bayData, "PUT");
  },

  // Delete bay
  deleteBay: async (bayId: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/bays/${bayId}`, undefined, "DELETE");
  },
};

// Validation helpers
export const bayValidators = {
  bayName: (name: string): string | null => {
    if (!name.trim()) return "Bay name is required";
    if (name.trim().length < 2) return "Bay name must be at least 2 characters";
    if (name.trim().length > 50)
      return "Bay name must be less than 50 characters";
    return null;
  },

  bayNo: (bayNo: string): string | null => {
    if (!bayNo.trim()) return "Bay number is required";
    if (!/^[A-Za-z0-9\s-]+$/.test(bayNo.trim())) {
      return "Bay number can only contain letters, numbers, spaces, and hyphens";
    }
    if (bayNo.trim().length > 20)
      return "Bay number must be less than 20 characters";
    return null;
  },

  bayStatus: (status: string): string | null => {
    if (!status) return "Bay status is required";
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return "Bay status must be either 'ACTIVE' or 'INACTIVE'";
    }
    return null;
  },
};

// Utility functions
export const bayUtils = {
  // Format bay status for display
  formatStatus: (
    status: "ACTIVE" | "INACTIVE",
  ): { text: string; className: string } => {
    switch (status) {
      case "ACTIVE":
        return {
          text: "Active",
          className:
            "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium",
        };
      case "INACTIVE":
        return {
          text: "Inactive",
          className:
            "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium",
        };
      default:
        return {
          text: "Unknown",
          className:
            "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium",
        };
    }
  },

  // Sort bays by number
  sortBays: (bays: Bay[]): Bay[] => {
    return [...bays].sort((a, b) => {
      // Extract numbers from number for proper sorting
      const aNum = parseInt(a.number.replace(/\D/g, "")) || 0;
      const bNum = parseInt(b.number.replace(/\D/g, "")) || 0;
      return aNum - bNum;
    });
  },

  // Filter bays by status
  filterBaysByStatus: (
    bays: Bay[],
    status: "ACTIVE" | "INACTIVE" | "all",
  ): Bay[] => {
    if (status === "all") return bays;
    return bays.filter((bay) => bay.status === status);
  },

  // Search bays by name or number
  searchBays: (bays: Bay[], query: string): Bay[] => {
    if (!query.trim()) return bays;
    const lowercaseQuery = query.toLowerCase();
    return bays.filter(
      (bay) =>
        bay.name.toLowerCase().includes(lowercaseQuery) ||
        bay.number.toLowerCase().includes(lowercaseQuery),
    );
  },
};
