// Bay management API functions

export interface Bay {
  bay_id: string;
  bay_name: string;
  bay_no: string;
  bay_status: "active" | "inactive";
}

export interface CreateBayData {
  bay_name: string;
  bay_no: string;
  bay_status: "active" | "inactive";
}

export interface UpdateBayData {
  bay_name: string;
  bay_no: string;
  bay_status: "active" | "inactive";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

// API call helper
async function apiCall<T>(
  endpoint: string,
  data?: any,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET"
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

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
    return getAllBays();
  },

  // Get bay by ID
  getBayById: async (bayId: string): Promise<ApiResponse<Bay>> => {
    return apiCall<Bay>(`/api/admin/bays/${bayId}`);
  },

  // Create new bay
  createBay: async (bayData: CreateBayData): Promise<ApiResponse<Bay>> => {
    return apiCall<Bay>("/api/admin/bays", bayData, "POST");
  },

  // Update bay
  updateBay: async (
    bayId: string,
    bayData: UpdateBayData
  ): Promise<ApiResponse<Bay>> => {
    return apiCall<Bay>(`/api/admin/bays/${bayId}`, bayData, "PUT");
  },

  // Delete bay
  deleteBay: async (bayId: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/api/admin/bays/${bayId}`, undefined, "DELETE");
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
    if (!["active", "inactive"].includes(status)) {
      return "Bay status must be either 'active' or 'inactive'";
    }
    return null;
  },
};

// Utility functions
export const bayUtils = {
  // Format bay status for display
  formatStatus: (
    status: "active" | "inactive"
  ): { text: string; className: string } => {
    switch (status) {
      case "active":
        return {
          text: "Active",
          className:
            "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium",
        };
      case "inactive":
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

  // Sort bays by bay_no
  sortBays: (bays: Bay[]): Bay[] => {
    return [...bays].sort((a, b) => {
      // Extract numbers from bay_no for proper sorting
      const aNum = parseInt(a.bay_no.replace(/\D/g, "")) || 0;
      const bNum = parseInt(b.bay_no.replace(/\D/g, "")) || 0;
      return aNum - bNum;
    });
  },

  // Filter bays by status
  filterBaysByStatus: (
    bays: Bay[],
    status: "active" | "inactive" | "all"
  ): Bay[] => {
    if (status === "all") return bays;
    return bays.filter((bay) => bay.bay_status === status);
  },

  // Search bays by name or number
  searchBays: (bays: Bay[], query: string): Bay[] => {
    if (!query.trim()) return bays;
    const lowercaseQuery = query.toLowerCase();
    return bays.filter(
      (bay) =>
        bay.bay_name.toLowerCase().includes(lowercaseQuery) ||
        bay.bay_no.toLowerCase().includes(lowercaseQuery)
    );
  },
};

const getAllBays = async (): Promise<ApiResponse<Bay[]>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockBays: Bay[] = [
    {
      bay_id: "bay-001",
      bay_name: "Main Entrance Bay A",
      bay_no: "A001",
      bay_status: "active"
    },
    {
      bay_id: "bay-002", 
      bay_name: "Main Entrance Bay B",
      bay_no: "A002",
      bay_status: "active"
    },
    {
      bay_id: "bay-003",
      bay_name: "Section B Loading Bay",
      bay_no: "B001", 
      bay_status: "inactive"
    },
    {
      bay_id: "bay-004",
      bay_name: "Section B Standard Bay",
      bay_no: "B002",
      bay_status: "active"
    },
    {
      bay_id: "bay-005",
      bay_name: "Level 2 Premium Bay",
      bay_no: "C001",
      bay_status: "active"
    },
    {
      bay_id: "bay-006",
      bay_name: "Level 2 Standard Bay A", 
      bay_no: "C002",
      bay_status: "inactive"
    },
    {
      bay_id: "bay-007",
      bay_name: "Level 2 Standard Bay B",
      bay_no: "C003", 
      bay_status: "active"
    },
    {
      bay_id: "bay-008",
      bay_name: "Basement Level Bay",
      bay_no: "D001",
      bay_status: "active"
    },
    {
      bay_id: "bay-009",
      bay_name: "Emergency Access Bay",
      bay_no: "E001",
      bay_status: "inactive"
    },
    {
      bay_id: "bay-010",
      bay_name: "VIP Reserved Bay",
      bay_no: "V001",
      bay_status: "active"
    },
    {
      bay_id: "bay-011",
      bay_name: "Electric Vehicle Bay A",
      bay_no: "EV01",
      bay_status: "active"
    },
    {
      bay_id: "bay-012",
      bay_name: "Electric Vehicle Bay B", 
      bay_no: "EV02",
      bay_status: "active"
    },
    {
      bay_id: "bay-013",
      bay_name: "Handicapped Access Bay",
      bay_no: "H001",
      bay_status: "active"
    },
    {
      bay_id: "bay-014",
      bay_name: "Oversized Vehicle Bay",
      bay_no: "OS01",
      bay_status: "inactive"
    },
    {
      bay_id: "bay-015",
      bay_name: "Visitor Parking Bay",
      bay_no: "V002",
      bay_status: "active"
    }
  ];

  return {
    success: true,
    data: mockBays,
    message: "Successfully retrieved all bays",
    count: mockBays.length
  };
};