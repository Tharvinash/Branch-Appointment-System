// Booking API helper functions

export interface Booking {
  id: string;
  vehicleNo: string;
  sva: string; // Service Advisor
  checkInDate: string;
  promisedDate: string;
  flow?: string;
  currentProcess: string;
  status:
    | "queuing"
    | "bay_queue"
    | "next_job"
    | "active"
    | "stoppage"
    | "completed";
  startTime: string;
  endTime: string;
  bayId: string;
  priority: "high" | "medium" | "low";
  processName?: string;
}

export interface ProcessStep {
  id: string;
  bookingId: string;
  processName: string;
  status: "started" | "paused" | "completed";
  startTime: string;
  endTime?: string;
  notes?: string;
  bayId?: string;
  technicianId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessHistoryResponse {
  success: boolean;
  data?: ProcessStep[];
  message?: string;
}

export interface ProcessStepResponse {
  success: boolean;
  data?: ProcessStep;
  message?: string;
}

export interface CreateBookingRequest {
  vehicleNo: string;
  sva: string;
  checkInDate: string;
  promisedDate: string;
  flow?: string;
  currentProcess: string;
  priority: "high" | "medium" | "low";
}

export interface UpdateBookingRequest {
  status?:
    | "queuing"
    | "bay_queue"
    | "next_job"
    | "active"
    | "stoppage"
    | "completed";
  bayId?: string;
  processName?: string;
  startTime?: string;
  endTime?: string;
}

export interface BookingResponse {
  success: boolean;
  data?: Booking;
  message?: string;
}

export interface BookingsResponse {
  success: boolean;
  data?: Booking[];
  message?: string;
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Token management
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

// API call helper
async function apiCall<T>(
  endpoint: string,
  data: any,
  method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE" = "POST"
): Promise<T> {
  const token = getAuthToken();

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

// Booking API functions
export const bookingAPI = {
  // Create new booking (Check-in)
  createBooking: async (
    bookingData: CreateBookingRequest
  ): Promise<BookingResponse> => {
    try {
      const response = await apiCall<BookingResponse>(
        "/api/bookings",
        { ...bookingData, status: "queuing" },
        "POST"
      );
      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create booking",
      };
    }
  },

  // Get all bookings
  getBookings: async (): Promise<BookingsResponse> => {
    try {
      const response = await apiCall<BookingsResponse>(
        "/api/bookings",
        {},
        "GET"
      );
      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch bookings",
      };
    }
  },

  // Update booking status and details
  updateBooking: async (
    bookingId: string,
    updateData: UpdateBookingRequest
  ): Promise<BookingResponse> => {
    try {
      const response = await apiCall<BookingResponse>(
        `/api/bookings/${bookingId}`,
        updateData,
        "PATCH"
      );
      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update booking",
      };
    }
  },

  // Workflow status transitions
  workflow: {
    // Queuing → Bay Queue
    assignToBay: async (
      bookingId: string,
      bayId: string
    ): Promise<BookingResponse> => {
      try {
        const response = await apiCall<BookingResponse>(
          `/api/bookings/${bookingId}`,
          { status: "bay_queue", bayId },
          "PATCH"
        );
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to assign to bay",
        };
      }
    },

    // Bay Queue → Next Job
    moveToNextJob: async (
      bookingId: string,
      processName: string
    ): Promise<BookingResponse> => {
      try {
        const response = await apiCall<BookingResponse>(
          `/api/bookings/${bookingId}`,
          { status: "next_job", processName },
          "PATCH"
        );
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to move to next job",
        };
      }
    },

    // Next Job → Active
    startJob: async (
      bookingId: string,
      startTime: string,
      endTime: string
    ): Promise<BookingResponse> => {
      try {
        const response = await apiCall<BookingResponse>(
          `/api/bookings/${bookingId}`,
          { status: "active", startTime, endTime },
          "PATCH"
        );
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to start job",
        };
      }
    },

    // Active → Stoppage
    pauseJob: async (bookingId: string): Promise<BookingResponse> => {
      try {
        const response = await apiCall<BookingResponse>(
          `/api/bookings/${bookingId}`,
          { status: "stoppage" },
          "PATCH"
        );
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to pause job",
        };
      }
    },

    // Stoppage → Active
    resumeJob: async (bookingId: string): Promise<BookingResponse> => {
      try {
        const response = await apiCall<BookingResponse>(
          `/api/bookings/${bookingId}`,
          { status: "active" },
          "PATCH"
        );
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to resume job",
        };
      }
    },

    // Active → Completed
    completeJob: async (bookingId: string): Promise<BookingResponse> => {
      try {
        const response = await apiCall<BookingResponse>(
          `/api/bookings/${bookingId}`,
          { status: "completed" },
          "PATCH"
        );
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to complete job",
        };
      }
    },
  },

  // Process tracking functions
  processTracking: {
    // Add a process step (history log)
    addProcessStep: async (
      bookingId: string,
      processData: {
        processName: string;
        status: "started" | "paused" | "completed";
        startTime: string;
        endTime?: string;
        notes?: string;
        bayId?: string;
        technicianId?: string;
      }
    ): Promise<ProcessStepResponse> => {
      try {
        const response = await apiCall<ProcessStepResponse>(
          `/api/bookings/${bookingId}/processes`,
          processData,
          "POST"
        );
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to add process step",
        };
      }
    },

    // Update process (start, pause, complete)
    updateProcess: async (
      processId: string,
      updateData: {
        status?: "started" | "paused" | "completed";
        endTime?: string;
        notes?: string;
        bayId?: string;
        technicianId?: string;
      }
    ): Promise<ProcessStepResponse> => {
      try {
        const response = await apiCall<ProcessStepResponse>(
          `/api/processes/${processId}`,
          updateData,
          "PATCH"
        );
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to update process",
        };
      }
    },

    // Fetch process history for a booking
    getProcessHistory: async (bookingId: string): Promise<ProcessHistoryResponse> => {
      try {
        const response = await apiCall<ProcessHistoryResponse>(
          `/api/bookings/${bookingId}/processes`,
          {},
          "GET"
        );
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to fetch process history",
        };
      }
    },
  },
};

// Status utilities
export const bookingUtils = {
  getStatusColor: (status: Booking["status"]) => {
    switch (status) {
      case "queuing":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "bay_queue":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "next_job":
        return "bg-purple-100 border-purple-300 text-purple-800";
      case "active":
        return "bg-green-100 border-green-300 text-green-800";
      case "stoppage":
        return "bg-red-100 border-red-300 text-red-800";
      case "completed":
        return "bg-gray-100 border-gray-300 text-gray-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  },

  getStatusText: (status: Booking["status"]) => {
    switch (status) {
      case "queuing":
        return "Queuing";
      case "bay_queue":
        return "Bay Queue";
      case "next_job":
        return "Next Job";
      case "active":
        return "Active";
      case "stoppage":
        return "Stoppage";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  },

  getNextActions: (status: Booking["status"]) => {
    switch (status) {
      case "queuing":
        return ["Assign to Bay"];
      case "bay_queue":
        return ["Move to Next Job"];
      case "next_job":
        return ["Start Job"];
      case "active":
        return ["Pause Job", "Complete Job"];
      case "stoppage":
        return ["Resume Job"];
      case "completed":
        return [];
      default:
        return [];
    }
  },

  canTransitionTo: (
    currentStatus: Booking["status"],
    targetStatus: Booking["status"]
  ) => {
    const validTransitions: Record<Booking["status"], Booking["status"][]> = {
      queuing: ["bay_queue"],
      bay_queue: ["next_job"],
      next_job: ["active"],
      active: ["stoppage", "completed"],
      stoppage: ["active"],
      completed: [],
    };

    return validTransitions[currentStatus]?.includes(targetStatus) || false;
  },
};

// Form validation
export const bookingValidators = {
  vehicleNo: (vehicleNo: string): string | null => {
    if (!vehicleNo.trim()) return "Vehicle number is required";
    if (vehicleNo.trim().length < 3)
      return "Vehicle number must be at least 3 characters";
    return null;
  },

  sva: (sva: string): string | null => {
    if (!sva.trim()) return "Service Advisor is required";
    if (sva.trim().length < 2)
      return "Service Advisor name must be at least 2 characters";
    return null;
  },

  checkInDate: (date: string): string | null => {
    if (!date) return "Check-in date is required";
    const checkInDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) return "Check-in date cannot be in the past";
    return null;
  },

  promisedDate: (promisedDate: string, checkInDate: string): string | null => {
    if (!promisedDate) return "Promised date is required";
    const promised = new Date(promisedDate);
    const checkIn = new Date(checkInDate);

    if (promised <= checkIn) return "Promised date must be after check-in date";
    return null;
  },

  priority: (priority: string): string | null => {
    if (!priority) return "Priority is required";
    if (!["high", "medium", "low"].includes(priority))
      return "Invalid priority level";
    return null;
  },
};
