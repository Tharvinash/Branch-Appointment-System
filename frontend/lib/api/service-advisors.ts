/**
 * Service Advisor API Helper
 * Handles all service advisor-related API calls and data management
 */

// Base API URL - adjust based on your backend configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Types
export interface ServiceAdvisor {
  service_advisor_id: string;
  name: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceAdvisorData {
  name: string;
  status: "active" | "inactive";
}

export interface UpdateServiceAdvisorData {
  name: string;
  status: "active" | "inactive";
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

// Service Advisor API Functions
export const serviceAdvisorAPI = {
  // Get all service advisors
  getAllServiceAdvisors: async (): Promise<ApiResponse<ServiceAdvisor[]>> => {
    return getAllServiceAdvisors();
  },

  // Get service advisor by ID
  getServiceAdvisorById: async (
    id: string
  ): Promise<ApiResponse<ServiceAdvisor>> => {
    return apiCall<ServiceAdvisor>(`/api/admin/service-advisors/${id}`);
  },

  // Create new service advisor
  createServiceAdvisor: async (
    data: CreateServiceAdvisorData
  ): Promise<ApiResponse<ServiceAdvisor>> => {
    return apiCall<ServiceAdvisor>("/api/admin/service-advisors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update service advisor
  updateServiceAdvisor: async (
    id: string,
    data: UpdateServiceAdvisorData
  ): Promise<ApiResponse<ServiceAdvisor>> => {
    return apiCall<ServiceAdvisor>(`/api/admin/service-advisors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete service advisor
  deleteServiceAdvisor: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/api/admin/service-advisors/${id}`, {
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
    if (!["active", "inactive"].includes(status)) {
      return "Service advisor status must be either 'available' or 'on leave'";
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
    status: "active" | "inactive"
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
        serviceAdvisor.service_advisor_id.toLowerCase().includes(searchQuery)
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

  // Get service advisor statistics
  getStatistics: (serviceAdvisors: ServiceAdvisor[]) => {
    const total = serviceAdvisors.length;
    const active = serviceAdvisors.filter((s) => s.status === "active").length;
    const inactive = serviceAdvisors.filter(
      (s) => s.status === "inactive"
    ).length;

    return {
      total,
      active,
      inactive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  },
};

const getAllServiceAdvisors = async (): Promise<ApiResponse<ServiceAdvisor[]>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockServiceAdvisors: ServiceAdvisor[] = [
    {
      service_advisor_id: "sa-001",
      name: "Ahmad Zulkifli",
      status: "active",
      created_at: "2024-01-12T08:00:00Z",
      updated_at: "2025-09-18T10:30:00Z"
    },
    {
      service_advisor_id: "sa-002",
      name: "Sarah Lim",
      status: "active",
      created_at: "2024-02-08T09:15:00Z",
      updated_at: "2025-09-19T14:45:00Z"
    },
    {
      service_advisor_id: "sa-003",
      name: "Raj Patel",
      status: "inactive",
      created_at: "2023-11-25T10:30:00Z",
      updated_at: "2025-07-20T16:20:00Z"
    },
    {
      service_advisor_id: "sa-004",
      name: "Nurul Azizah",
      status: "active",
      created_at: "2024-03-15T11:00:00Z",
      updated_at: "2025-09-20T08:15:00Z"
    },
    {
      service_advisor_id: "sa-005",
      name: "David Wong",
      status: "active",
      created_at: "2024-04-22T13:45:00Z",
      updated_at: "2025-09-19T17:30:00Z"
    },
    {
      service_advisor_id: "sa-006",
      name: "Priya Sharma",
      status: "active",
      created_at: "2024-05-10T07:20:00Z",
      updated_at: "2025-09-18T12:10:00Z"
    },
    {
      service_advisor_id: "sa-007",
      name: "Muhammad Hafiz",
      status: "inactive",
      created_at: "2024-01-30T14:15:00Z",
      updated_at: "2025-08-15T09:45:00Z"
    },
    {
      service_advisor_id: "sa-008",
      name: "Chen Wei Lin",
      status: "active",
      created_at: "2024-06-18T09:30:00Z",
      updated_at: "2025-09-20T11:25:00Z"
    },
    {
      service_advisor_id: "sa-009",
      name: "Aminah Ismail",
      status: "active",
      created_at: "2024-07-05T15:00:00Z",
      updated_at: "2025-09-19T13:50:00Z"
    },
    {
      service_advisor_id: "sa-010",
      name: "Kumar Selvam",
      status: "active",
      created_at: "2024-08-12T08:45:00Z",
      updated_at: "2025-09-18T16:40:00Z"
    },
    {
      service_advisor_id: "sa-011",
      name: "Jessica Tan",
      status: "inactive",
      created_at: "2023-12-08T12:20:00Z",
      updated_at: "2025-06-25T10:15:00Z"
    },
    {
      service_advisor_id: "sa-012",
      name: "Farid Abdullah",
      status: "active",
      created_at: "2024-09-02T10:10:00Z",
      updated_at: "2025-09-20T09:05:00Z"
    },
    {
      service_advisor_id: "sa-013",
      name: "Mei Ling Goh",
      status: "active",
      created_at: "2024-03-28T16:30:00Z",
      updated_at: "2025-09-19T15:20:00Z"
    },
    {
      service_advisor_id: "sa-014",
      name: "Ravi Krishnan",
      status: "active",
      created_at: "2024-10-15T11:40:00Z",
      updated_at: "2025-09-18T14:35:00Z"
    },
    {
      service_advisor_id: "sa-015",
      name: "Siti Hajar",
      status: "inactive",
      created_at: "2024-02-14T09:25:00Z",
      updated_at: "2025-05-30T12:55:00Z"
    }
  ];

  return {
    success: true,
    data: mockServiceAdvisors,
    message: "Successfully retrieved all service advisors",
    timestamp: new Date().toISOString(),
    count: mockServiceAdvisors.length
  };
}