/**
 * Technician API Helper
 * Handles all technician-related API calls and data management
 */

// Base API URL - adjust based on your backend configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Types
export interface Technician {
  technician_id: string;
  technician_name: string;
  technician_status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

export interface CreateTechnicianData {
  technician_name: string;
  technician_status: "active" | "inactive";
}

export interface UpdateTechnicianData {
  technician_name: string;
  technician_status: "active" | "inactive";
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
    return getAllTechnicians();
  },

  // Get technician by ID
  getTechnicianById: async (id: string): Promise<ApiResponse<Technician>> => {
    return apiCall<Technician>(`/api/admin/technicians/${id}`);
  },

  // Create new technician
  createTechnician: async (
    data: CreateTechnicianData
  ): Promise<ApiResponse<Technician>> => {
    return apiCall<Technician>("/api/admin/technicians", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update technician
  updateTechnician: async (
    id: string,
    data: UpdateTechnicianData
  ): Promise<ApiResponse<Technician>> => {
    return apiCall<Technician>(`/api/admin/technicians/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete technician
  deleteTechnician: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/api/admin/technicians/${id}`, {
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
    if (!["active", "inactive"].includes(status)) {
      return "Technician status must be either 'available' or 'on leave'";
    }
    return null;
  },
};

// Utility Functions
export const technicianUtils = {
  // Sort technicians by name
  sortTechnicians: (technicians: Technician[]): Technician[] => {
    return [...technicians].sort((a, b) =>
      a.technician_name.localeCompare(b.technician_name)
    );
  },

  // Filter technicians by status
  filterByStatus: (
    technicians: Technician[],
    status: "active" | "inactive"
  ): Technician[] => {
    return technicians.filter(
      (technician) => technician.technician_status === status
    );
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
        technician.technician_name.toLowerCase().includes(searchQuery) ||
        technician.technician_id.toLowerCase().includes(searchQuery)
    );
  },

  // Format status for display
  formatStatus: (status: string) => {
    switch (status) {
      case "active":
        return {
          text: "Available",
          className:
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800",
        };
      case "inactive":
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
    const active = technicians.filter(
      (t) => t.technician_status === "active"
    ).length;
    const inactive = technicians.filter(
      (t) => t.technician_status === "inactive"
    ).length;

    return {
      total,
      active,
      inactive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  },
};

// Mock data for getAllTechnicians function

// Type definitions
export interface Technician {
  technician_id: string;
  technician_name: string;
  technician_status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  count?: number;
}

// Mock implementation
const getAllTechnicians = async (): Promise<ApiResponse<Technician[]>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockTechnicians: Technician[] = [
    {
      technician_id: "tech-001",
      technician_name: "Ahmad Bin Hassan",
      technician_status: "active",
      created_at: "2024-01-15T08:30:00Z",
      updated_at: "2025-09-18T14:22:00Z"
    },
    {
      technician_id: "tech-002",
      technician_name: "Siti Nurhaliza",
      technician_status: "active",
      created_at: "2024-02-20T10:15:00Z",
      updated_at: "2025-09-19T16:45:00Z"
    },
    {
      technician_id: "tech-003",
      technician_name: "Raj Kumar",
      technician_status: "inactive",
      created_at: "2024-01-08T09:00:00Z",
      updated_at: "2025-08-25T11:30:00Z"
    },
    {
      technician_id: "tech-004",
      technician_name: "Lim Wei Ming",
      technician_status: "active",
      created_at: "2024-03-12T13:45:00Z",
      updated_at: "2025-09-20T09:15:00Z"
    },
    {
      technician_id: "tech-005",
      technician_name: "Muhammad Faizal",
      technician_status: "active",
      created_at: "2024-04-05T07:20:00Z",
      updated_at: "2025-09-19T17:30:00Z"
    },
    {
      technician_id: "tech-006",
      technician_name: "Chen Li Hua",
      technician_status: "inactive",
      created_at: "2023-11-22T15:10:00Z",
      updated_at: "2025-07-14T10:45:00Z"
    },
    {
      technician_id: "tech-007",
      technician_name: "Priya Devi",
      technician_status: "active",
      created_at: "2024-05-18T11:25:00Z",
      updated_at: "2025-09-20T08:00:00Z"
    },
    {
      technician_id: "tech-008",
      technician_name: "David Tan",
      technician_status: "active",
      created_at: "2024-06-30T14:00:00Z",
      updated_at: "2025-09-18T15:20:00Z"
    },
    {
      technician_id: "tech-009",
      technician_name: "Nurul Aisyah",
      technician_status: "active",
      created_at: "2024-07-12T09:30:00Z",
      updated_at: "2025-09-19T12:10:00Z"
    },
    {
      technician_id: "tech-010",
      technician_name: "Kumar Selvam",
      technician_status: "inactive",
      created_at: "2024-02-28T16:45:00Z",
      updated_at: "2025-06-20T14:55:00Z"
    },
    {
      technician_id: "tech-011",
      technician_name: "Wong Mei Lin",
      technician_status: "active",
      created_at: "2024-08-15T10:00:00Z",
      updated_at: "2025-09-20T11:30:00Z"
    },
    {
      technician_id: "tech-012",
      technician_name: "Hafiz Rahman",
      technician_status: "active",
      created_at: "2024-09-01T08:15:00Z",
      updated_at: "2025-09-19T13:45:00Z"
    },
    {
      technician_id: "tech-013",
      technician_name: "Sarah Abdullah",
      technician_status: "active",
      created_at: "2024-03-25T12:30:00Z",
      updated_at: "2025-09-18T16:20:00Z"
    },
    {
      technician_id: "tech-014",
      technician_name: "Ravi Chandran",
      technician_status: "inactive",
      created_at: "2023-12-10T14:20:00Z",
      updated_at: "2025-05-15T09:40:00Z"
    },
    {
      technician_id: "tech-015",
      technician_name: "Lee Ah Kow",
      technician_status: "active",
      created_at: "2024-10-05T07:45:00Z",
      updated_at: "2025-09-20T10:05:00Z"
    }
  ];

  return {
    success: true,
    data: mockTechnicians,
    message: "Successfully retrieved all technicians",
    timestamp: new Date().toISOString(),
    count: mockTechnicians.length
  };
};
