/**
 * Technician API Helper
 * Handles all technician-related API calls and data management
 */

// Base API URL - adjust based on your backend configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Types
export interface Technician {
  id: number;
  name: string;
  status: "AVAILABLE" | "ON_LEAVE";
}

export interface CreateTechnicianData {
  name: string;
  status: "AVAILABLE" | "ON_LEAVE";
}

export interface UpdateTechnicianData {
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
    const token = localStorage.getItem("token");

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

// Technician API Functions
export const technicianAPI = {
  // Get all technicians
  getAllTechnicians: async (): Promise<ApiResponse<Technician[]>> => {
    return apiCall<Technician[]>("/technicians");
  },

  // Get technician by ID
  getTechnicianById: async (id: number): Promise<ApiResponse<Technician>> => {
    return apiCall<Technician>(`/technicians/${id}`);
  },

  // Create new technician
  createTechnician: async (
    data: CreateTechnicianData
  ): Promise<ApiResponse<Technician>> => {
    return apiCall<Technician>("/technicians", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update technician
  updateTechnician: async (
    id: number,
    data: UpdateTechnicianData
  ): Promise<ApiResponse<Technician>> => {
    return apiCall<Technician>(`/technicians/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete technician
  deleteTechnician: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/technicians/${id}`, {
      method: "DELETE",
    });
  },
};

// Validation Functions
export const technicianValidators = {
  technicianName: (name: string): string | null => {
    if (!name || name.trim().length === 0) {
      return "Technician name is required";
    }
    if (name.trim().length < 2) {
      return "Technician name must be at least 2 characters";
    }
    if (name.trim().length > 100) {
      return "Technician name must be less than 100 characters";
    }
    return null;
  },

  technicianStatus: (status: string): string | null => {
    if (!status) {
      return "Technician status is required";
    }
    if (!["AVAILABLE", "ON_LEAVE"].includes(status)) {
      return "Technician status must be either 'AVAILABLE' or 'ON_LEAVE'";
    }
    return null;
  },
};

// Utility Functions
export const technicianUtils = {
  // Sort technicians by name
  sortTechnicians: (technicians: Technician[]): Technician[] => {
    return [...technicians].sort((a, b) => a.name.localeCompare(b.name));
  },

  // Filter technicians by status
  filterByStatus: (
    technicians: Technician[],
    status: "AVAILABLE" | "ON_LEAVE"
  ): Technician[] => {
    return technicians.filter((technician) => technician.status === status);
  },

  // Search technicians by name
  searchTechnicians: (
    technicians: Technician[],
    query: string
  ): Technician[] => {
    if (!query.trim()) return technicians;

    const searchQuery = query.toLowerCase().trim();
    return technicians.filter(
      (technician) =>
        technician.name.toLowerCase().includes(searchQuery) ||
        technician.id.toString().includes(searchQuery)
    );
  },

  // Format status for display
  formatStatus: (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return {
          text: "Available",
          className:
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800",
        };
      case "ON_LEAVE":
        return {
          text: "On Leave",
          className:
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
        };
      default:
        return {
          text: "Unknown",
          className:
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800",
        };
    }
  },

  // Get technician statistics
  getStatistics: (technicians: Technician[]) => {
    const total = technicians.length;
    const available = technicians.filter(
      (t) => t.status === "AVAILABLE"
    ).length;
    const onLeave = technicians.filter((t) => t.status === "ON_LEAVE").length;

    return {
      total,
      available,
      onLeave,
      availablePercentage:
        total > 0 ? Math.round((available / total) * 100) : 0,
    };
  },
};
