// Booking API helper functions

import { tokenManager } from "@/lib/auth";

export interface Booking {
  id: number;
  carRegNo: string;
  checkinDate: string; // ISO string format
  promiseDate: string; // ISO string format
  serviceAdvisorId: number;
  bayId: number;
  jobType: "LIGHT" | "MEDIUM" | "HEAVY";
  status:
    | "QUEUING"
    | "BAY_QUEUE"
    | "NEXT_JOB"
    | "ACTIVE_BOARD"
    | "JOB_STOPPAGE"
    | "REPAIR_COMPLETION";
  jobStartTime?: string; // Time format HH:mm:ss
  jobEndTime?: string; // Time format HH:mm:ss
}

export interface ProcessStep {
  id: number;
  fromStatus: string;
  toStatus: string;
  fromProcess: {
    id: number;
    name: string;
    number: string;
    status: "ACTIVE" | "INACTIVE";
  };
  toProcess: {
    id: number;
    name: string;
    number: string;
    status: "ACTIVE" | "INACTIVE";
  };
  changedAt: string; // ISO string format
  jobStartTime?: string; // Time format HH:mm:ss
  jobEndTime?: string; // Time format HH:mm:ss
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
  carRegNo: string;
  checkinDate: string; // ISO string format
  promiseDate: string; // ISO string format
  serviceAdvisorId: number;
  bayId: number;
  jobType: "LIGHT" | "MEDIUM" | "HEAVY";
  status:
    | "QUEUING"
    | "BAY_QUEUE"
    | "NEXT_JOB"
    | "ACTIVE_BOARD"
    | "JOB_STOPPAGE"
    | "REPAIR_COMPLETION";
  jobStartTime?: string; // Time format HH:mm:ss
  jobEndTime?: string; // Time format HH:mm:ss
}

export interface UpdateBookingRequest {
  carRegNo?: string;
  checkinDate?: string;
  promiseDate?: string;
  serviceAdvisorId?: number;
  bayId?: number;
  jobType?: "LIGHT" | "MEDIUM" | "HEAVY";
  status?:
    | "QUEUING"
    | "BAY_QUEUE"
    | "NEXT_JOB"
    | "ACTIVE_BOARD"
    | "JOB_STOPPAGE"
    | "REPAIR_COMPLETION";
  jobStartTime?: string;
  jobEndTime?: string;
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
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// API call helper
async function apiCall<T>(
  endpoint: string,
  data: any,
  method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE" = "POST"
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

// Booking API functions
export const bookingAPI = {
  // Create new booking (Check-in)
  createBooking: async (
    bookingData: CreateBookingRequest
  ): Promise<BookingResponse> => {
    try {
      const response = await apiCall<Booking>("/bookings", bookingData, "POST");
      return {
        success: true,
        data: response,
      };
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
      const response = await apiCall<Booking[]>("/bookings", {}, "GET");
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch bookings",
      };
    }
  },

  // Get single booking by ID
  getBooking: async (bookingId: number): Promise<BookingResponse> => {
    try {
      const response = await apiCall<Booking>(
        `/bookings/${bookingId}`,
        {},
        "GET"
      );
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch booking",
      };
    }
  },

  // Update booking status and details
  updateBooking: async (
    bookingId: number,
    updateData: UpdateBookingRequest
  ): Promise<BookingResponse> => {
    try {
      const response = await apiCall<Booking>(
        `/bookings/${bookingId}`,
        updateData,
        "PUT"
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update booking",
      };
    }
  },

  // Delete booking
  deleteBooking: async (bookingId: number): Promise<BookingResponse> => {
    try {
      await apiCall<void>(`/bookings/${bookingId}`, {}, "DELETE");
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete booking",
      };
    }
  },

  // Get booking history
  getBookingHistory: async (
    bookingId: number
  ): Promise<ProcessHistoryResponse> => {
    try {
      const response = await apiCall<ProcessStep[]>(
        `/bookings/${bookingId}/history`,
        {},
        "GET"
      );
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch booking history",
      };
    }
  },

  // Workflow status transitions
  workflow: {
    // QUEUING → BAY_QUEUE
    assignToBay: async (
      bookingId: number,
      bayId: number
    ): Promise<BookingResponse> => {
      try {
        // First get the current booking data
        const currentBooking = await bookingAPI.getBooking(bookingId);
        if (!currentBooking.success || !currentBooking.data) {
          return {
            success: false,
            message: "Failed to fetch current booking data",
          };
        }

        // Update the booking with new status and bayId
        const updateData: UpdateBookingRequest = {
          ...currentBooking.data,
          status: "BAY_QUEUE",
          bayId: bayId,
        };

        const response = await bookingAPI.updateBooking(bookingId, updateData);
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to assign to bay",
        };
      }
    },

    // BAY_QUEUE → NEXT_JOB
    moveToNextJob: async (
      bookingId: number,
      bayId: number
    ): Promise<BookingResponse> => {
      try {
        // First get the current booking data
        const currentBooking = await bookingAPI.getBooking(bookingId);
        if (!currentBooking.success || !currentBooking.data) {
          return {
            success: false,
            message: "Failed to fetch current booking data",
          };
        }

        // Update the booking with new status
        const updateData: UpdateBookingRequest = {
          ...currentBooking.data,
          status: "NEXT_JOB",
          bayId: bayId,
        };

        const response = await bookingAPI.updateBooking(bookingId, updateData);
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

    // NEXT_JOB → ACTIVE_BOARD
    startJob: async (
      bookingId: number,
      jobStartTime: string,
      jobEndTime: string
    ): Promise<BookingResponse> => {
      try {
        // First get the current booking data
        const currentBooking = await bookingAPI.getBooking(bookingId);
        if (!currentBooking.success || !currentBooking.data) {
          return {
            success: false,
            message: "Failed to fetch current booking data",
          };
        }

        // Update the booking with new status and times
        const updateData: UpdateBookingRequest = {
          ...currentBooking.data,
          status: "ACTIVE_BOARD",
          jobStartTime,
          jobEndTime,
        };

        const response = await bookingAPI.updateBooking(bookingId, updateData);
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to start job",
        };
      }
    },

    // ACTIVE_BOARD → JOB_STOPPAGE
    pauseJob: async (bookingId: number): Promise<BookingResponse> => {
      try {
        // First get the current booking data
        const currentBooking = await bookingAPI.getBooking(bookingId);
        if (!currentBooking.success || !currentBooking.data) {
          return {
            success: false,
            message: "Failed to fetch current booking data",
          };
        }

        // Update the booking with new status
        const updateData: UpdateBookingRequest = {
          ...currentBooking.data,
          status: "JOB_STOPPAGE",
        };

        const response = await bookingAPI.updateBooking(bookingId, updateData);
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to pause job",
        };
      }
    },

    // JOB_STOPPAGE → ACTIVE_BOARD
    resumeJob: async (bookingId: number): Promise<BookingResponse> => {
      try {
        // First get the current booking data
        const currentBooking = await bookingAPI.getBooking(bookingId);
        if (!currentBooking.success || !currentBooking.data) {
          return {
            success: false,
            message: "Failed to fetch current booking data",
          };
        }

        // Update the booking with new status
        const updateData: UpdateBookingRequest = {
          ...currentBooking.data,
          status: "ACTIVE_BOARD",
        };

        const response = await bookingAPI.updateBooking(bookingId, updateData);
        return response;
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to resume job",
        };
      }
    },

    // ACTIVE_BOARD → REPAIR_COMPLETION
    completeJob: async (bookingId: number): Promise<BookingResponse> => {
      try {
        // First get the current booking data
        const currentBooking = await bookingAPI.getBooking(bookingId);
        if (!currentBooking.success || !currentBooking.data) {
          return {
            success: false,
            message: "Failed to fetch current booking data",
          };
        }

        // Update the booking with new status
        const updateData: UpdateBookingRequest = {
          ...currentBooking.data,
          status: "REPAIR_COMPLETION",
        };

        const response = await bookingAPI.updateBooking(bookingId, updateData);
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
            error instanceof Error
              ? error.message
              : "Failed to add process step",
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
    getProcessHistory: async (
      bookingId: string
    ): Promise<ProcessHistoryResponse> => {
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
            error instanceof Error
              ? error.message
              : "Failed to fetch process history",
        };
      }
    },
  },
};

// Status utilities
export const bookingUtils = {
  getStatusColor: (status: Booking["status"]) => {
    switch (status) {
      case "QUEUING":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "BAY_QUEUE":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "NEXT_JOB":
        return "bg-purple-100 border-purple-300 text-purple-800";
      case "ACTIVE_BOARD":
        return "bg-green-100 border-green-300 text-green-800";
      case "JOB_STOPPAGE":
        return "bg-red-100 border-red-300 text-red-800";
      case "REPAIR_COMPLETION":
        return "bg-gray-100 border-gray-300 text-gray-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  },

  getStatusText: (status: Booking["status"]) => {
    switch (status) {
      case "QUEUING":
        return "Queuing";
      case "BAY_QUEUE":
        return "Bay Queue";
      case "NEXT_JOB":
        return "Next Job";
      case "ACTIVE_BOARD":
        return "Active Board";
      case "JOB_STOPPAGE":
        return "Job Stoppage";
      case "REPAIR_COMPLETION":
        return "Repair Completion";
      default:
        return "Unknown";
    }
  },

  getNextActions: (status: Booking["status"]) => {
    switch (status) {
      case "QUEUING":
        return ["Assign to Bay"];
      case "BAY_QUEUE":
        return ["Move to Next Job"];
      case "NEXT_JOB":
        return ["Start Job"];
      case "ACTIVE_BOARD":
        return ["Pause Job", "Complete Job"];
      case "JOB_STOPPAGE":
        return ["Resume Job"];
      case "REPAIR_COMPLETION":
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
      QUEUING: ["BAY_QUEUE"],
      BAY_QUEUE: ["NEXT_JOB"],
      NEXT_JOB: ["ACTIVE_BOARD"],
      ACTIVE_BOARD: ["JOB_STOPPAGE", "REPAIR_COMPLETION"],
      JOB_STOPPAGE: ["ACTIVE_BOARD"],
      REPAIR_COMPLETION: [],
    };

    return validTransitions[currentStatus]?.includes(targetStatus) || false;
  },

  getJobTypeText: (jobType: Booking["jobType"]) => {
    switch (jobType) {
      case "LIGHT":
        return "Light";
      case "MEDIUM":
        return "Medium";
      case "HEAVY":
        return "Heavy";
      default:
        return "Unknown";
    }
  },

  getJobTypeColor: (jobType: Booking["jobType"]) => {
    switch (jobType) {
      case "LIGHT":
        return "bg-green-100 border-green-300 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "HEAVY":
        return "bg-red-100 border-red-300 text-red-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  },
};

// Form validation
export const bookingValidators = {
  carRegNo: (carRegNo: string): string | null => {
    if (!carRegNo.trim()) return "Car registration number is required";
    if (carRegNo.trim().length < 3)
      return "Car registration number must be at least 3 characters";
    return null;
  },

  serviceAdvisorId: (serviceAdvisorId: number): string | null => {
    if (!serviceAdvisorId || serviceAdvisorId <= 0)
      return "Service Advisor is required";
    return null;
  },

  bayId: (bayId: number): string | null => {
    if (!bayId || bayId <= 0) return "Bay is required";
    return null;
  },

  checkinDate: (date: string): string | null => {
    if (!date) return "Check-in date is required";
    const checkinDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkinDate < today) return "Check-in date cannot be in the past";
    return null;
  },

  promiseDate: (promiseDate: string, checkinDate: string): string | null => {
    if (!promiseDate) return "Promise date is required";
    const promised = new Date(promiseDate);
    const checkin = new Date(checkinDate);

    if (promised < checkin) return "Promise date must be after check-in date";
    return null;
  },

  jobType: (jobType: string): string | null => {
    if (!jobType) return "Job type is required";
    if (!["LIGHT", "MEDIUM", "HEAVY"].includes(jobType))
      return "Invalid job type";
    return null;
  },

  status: (status: string): string | null => {
    if (!status) return "Status is required";
    if (
      ![
        "QUEUING",
        "BAY_QUEUE",
        "NEXT_JOB",
        "ACTIVE_BOARD",
        "JOB_STOPPAGE",
        "REPAIR_COMPLETION",
      ].includes(status)
    )
      return "Invalid status";
    return null;
  },
};
