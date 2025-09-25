"use client";

import React, { useState, useEffect } from "react";
import {
  bookingUtils,
  Booking,
  bookingAPI,
  bookingValidators,
} from "@/lib/api/bookings";
import { serviceAdvisorAPI, ServiceAdvisor } from "@/lib/api/service-advisors";
import { bayAPI, Bay as BayType } from "@/lib/api/bays";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Bay {
  id: string;
  name: string;
  process: string;
  status: "active" | "inactive" | "maintenance";
}

interface BookingEditModalProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onSuccess: () => void;
  onViewHistory: (booking: Booking) => void;
  onPauseJob?: (bookingId: number) => void;
}

const BookingEditModal: React.FC<BookingEditModalProps> = ({
  open,
  booking,
  onClose,
  onSuccess,
  onViewHistory,
  onPauseJob,
}) => {
  const [formData, setFormData] = useState({
    carRegNo: booking?.carRegNo || "",
    checkinDate: booking?.checkinDate || "",
    promiseDate: booking?.promiseDate || "",
    serviceAdvisorId: booking?.serviceAdvisorId || 0,
    bayId: booking?.bayId || 0,
    jobType: booking?.jobType || "MEDIUM",
    status: booking?.status || "QUEUING",
    jobStartTime: booking?.jobStartTime || "",
    jobEndTime: booking?.jobEndTime || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [serviceAdvisors, setServiceAdvisors] = useState<ServiceAdvisor[]>([]);
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(false);
  const [bays, setBays] = useState<BayType[]>([]);
  const [isLoadingBays, setIsLoadingBays] = useState(false);

  // Fetch service advisors and bays on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch service advisors
      setIsLoadingAdvisors(true);
      try {
        const response = await serviceAdvisorAPI.getAllServiceAdvisors();
        if (response.success && response.data) {
          setServiceAdvisors(response.data);
        } else {
          console.error("Failed to fetch service advisors:", response.message);
        }
      } catch (error) {
        console.error("Error fetching service advisors:", error);
      } finally {
        setIsLoadingAdvisors(false);
      }

      // Fetch bays
      setIsLoadingBays(true);
      try {
        const response = await bayAPI.getAllBays();
        if (response.success && response.data) {
          setBays(response.data);
        } else {
          console.error("Failed to fetch bays:", response.message);
        }
      } catch (error) {
        console.error("Error fetching bays:", error);
      } finally {
        setIsLoadingBays(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // Update form data when booking changes
  useEffect(() => {
    if (booking) {
      setFormData({
        carRegNo: booking.carRegNo,
        checkinDate: booking.checkinDate
          ? new Date(booking.checkinDate).toISOString().split("T")[0]
          : "",
        promiseDate: booking.promiseDate
          ? new Date(booking.promiseDate).toISOString().split("T")[0]
          : "",
        serviceAdvisorId: booking.serviceAdvisorId,
        bayId: booking.bayId,
        jobType: booking.jobType,
        status: booking.status,
        jobStartTime: booking.jobStartTime || "",
        jobEndTime: booking.jobEndTime || "",
      });
    }
  }, [booking]);

  // Don't render if booking is null
  if (!booking) {
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const carRegNoError = bookingValidators.carRegNo(formData.carRegNo);
    if (carRegNoError) newErrors.carRegNo = carRegNoError;

    const checkinDateError = bookingValidators.checkinDate(
      formData.checkinDate
    );
    if (checkinDateError) newErrors.checkinDate = checkinDateError;

    const promiseDateError = bookingValidators.promiseDate(
      formData.promiseDate,
      formData.checkinDate
    );
    if (promiseDateError) newErrors.promiseDate = promiseDateError;

    const serviceAdvisorIdError = bookingValidators.serviceAdvisorId(
      formData.serviceAdvisorId
    );
    if (serviceAdvisorIdError)
      newErrors.serviceAdvisorId = serviceAdvisorIdError;

    const bayIdError = bookingValidators.bayId(formData.bayId);
    if (bayIdError) newErrors.bayId = bayIdError;

    const jobTypeError = bookingValidators.jobType(formData.jobType);
    if (jobTypeError) newErrors.jobType = jobTypeError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const response = await bookingAPI.updateBooking(booking.id, {
        carRegNo: formData.carRegNo.trim(),
        checkinDate: formData.checkinDate,
        promiseDate: formData.promiseDate,
        serviceAdvisorId: formData.serviceAdvisorId,
        bayId: formData.bayId,
        jobType: formData.jobType,
        status: formData.status,
        jobStartTime: formData.jobStartTime || undefined,
        jobEndTime: formData.jobEndTime || undefined,
      });

      if (response.success) {
        onSuccess();
        handleClose();
      } else {
        setApiError(response.message || "Failed to update booking");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToBay = async () => {
    if (!booking) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await bookingAPI.workflow.assignToBay(
        booking.id,
        formData.bayId
      );

      if (response.success) {
        onSuccess();
      } else {
        setApiError(response.message || "Failed to assign to bay");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToNextJob = async () => {
    if (!booking) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await bookingAPI.workflow.moveToNextJob(
        booking.id,
        formData.bayId
      );

      if (response.success) {
        onSuccess();
      } else {
        setApiError(response.message || "Failed to move to next job");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseJob = () => {
    if (!booking) return;
    onClose(); // Close the edit booking modal
    if (onPauseJob) {
      onPauseJob(booking.id);
    }
  };

  const handleCompleteJob = async () => {
    if (!booking) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await bookingAPI.workflow.completeJob(booking.id);

      if (response.success) {
        onSuccess();
      } else {
        setApiError(response.message || "Failed to move to next job");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeJob = async () => {
    if (!booking) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await bookingAPI.workflow.resumeJob(booking.id);

      if (response.success) {
        onSuccess();
      } else {
        setApiError(response.message || "Failed to move to next job");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startJob = async () => {
    if (!booking) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await bookingAPI.workflow.startJob(
        booking.id,
        formData.jobStartTime,
        formData.jobEndTime
      );

      if (response.success) {
        onSuccess();
      } else {
        setApiError(response.message || "Failed to start job");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setApiError("");
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (apiError) setApiError("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update booking details and workflow actions for {booking.carRegNo}
              .
            </DialogDescription>
          </DialogHeader>
          {/* Booking Info */}
          <div className="mb-6 p-4 bg-toyota-gray rounded-lg">
            <h4 className="text-sm font-semibold text-toyota-black mb-2">
              Booking Details
            </h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Vehicle:</span> {booking.carRegNo}
              </div>
              <div>
                <span className="font-medium">Service Advisor ID:</span>{" "}
                {booking.serviceAdvisorId}
              </div>
              <div>
                <span className="font-medium">Check-in:</span>{" "}
                {new Date(booking.checkinDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Promise:</span>{" "}
                {new Date(booking.promiseDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Job Type:</span>{" "}
                {bookingUtils.getJobTypeText(booking.jobType)}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                {bookingUtils.getStatusText(booking.status)}
              </div>
              {booking.status === "JOB_STOPPAGE" && booking.stoppageReason && (
                <div>
                  <span className="font-medium">Stoppage Reason:</span>{" "}
                  <span className="text-red-600 font-medium">
                    {booking.stoppageReason}
                  </span>
                </div>
              )}
            </div>
          </div>

          <form
            id="edit-booking-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* API Error Alert */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Car Registration Number */}
              <div className="space-y-2">
                <Label htmlFor="carRegNo">
                  Car Registration Number{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="carRegNo"
                  type="text"
                  value={formData.carRegNo}
                  onChange={(e) =>
                    handleInputChange("carRegNo", e.target.value)
                  }
                  className={errors.carRegNo ? "border-red-500" : ""}
                />
                {errors.carRegNo && (
                  <p className="text-red-500 text-xs">{errors.carRegNo}</p>
                )}
              </div>

              {/* Service Advisor */}
              <div className="space-y-2">
                <Label htmlFor="serviceAdvisorId">
                  Service Advisor <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.serviceAdvisorId.toString()}
                  onValueChange={(value) =>
                    handleInputChange("serviceAdvisorId", parseInt(value))
                  }
                >
                  <SelectTrigger
                    className={errors.serviceAdvisorId ? "border-red-500" : ""}
                    disabled={isLoadingAdvisors}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingAdvisors
                          ? "Loading..."
                          : "Select Service Advisor"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceAdvisors.map((advisor) => (
                      <SelectItem
                        key={advisor.id}
                        value={advisor.id.toString()}
                      >
                        {advisor.name} (ID: {advisor.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceAdvisorId && (
                  <p className="text-red-500 text-xs">
                    {errors.serviceAdvisorId}
                  </p>
                )}
              </div>

              {/* Check-in Date */}
              <div className="space-y-2">
                <Label htmlFor="checkinDate">
                  Check-in Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="checkinDate"
                  type="date"
                  value={formData.checkinDate}
                  onChange={(e) =>
                    handleInputChange("checkinDate", e.target.value)
                  }
                  className={errors.checkinDate ? "border-red-500" : ""}
                />
                {errors.checkinDate && (
                  <p className="text-red-500 text-xs">{errors.checkinDate}</p>
                )}
              </div>

              {/* Promise Date */}
              <div className="space-y-2">
                <Label htmlFor="promiseDate">
                  Promise Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="promiseDate"
                  type="date"
                  value={formData.promiseDate}
                  onChange={(e) =>
                    handleInputChange("promiseDate", e.target.value)
                  }
                  className={errors.promiseDate ? "border-red-500" : ""}
                />
                {errors.promiseDate && (
                  <p className="text-red-500 text-xs">{errors.promiseDate}</p>
                )}
              </div>

              {/* Bay */}
              <div className="space-y-2">
                <Label htmlFor="bayId">
                  Bay <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.bayId.toString()}
                  onValueChange={(value) =>
                    handleInputChange("bayId", parseInt(value))
                  }
                >
                  <SelectTrigger
                    className={errors.bayId ? "border-red-500" : ""}
                    disabled={isLoadingBays}
                  >
                    <SelectValue
                      placeholder={isLoadingBays ? "Loading..." : "Select Bay"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {bays.map((bay) => (
                      <SelectItem key={bay.id} value={bay.id.toString()}>
                        {bay.name.name} (Bay {bay.number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bayId && (
                  <p className="text-red-500 text-xs">{errors.bayId}</p>
                )}
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <Label htmlFor="jobType">
                  Job Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(value) =>
                    handleInputChange(
                      "jobType",
                      value as "LIGHT" | "MEDIUM" | "HEAVY"
                    )
                  }
                >
                  <SelectTrigger
                    className={errors.jobType ? "border-red-500" : ""}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LIGHT">Light</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HEAVY">Heavy</SelectItem>
                  </SelectContent>
                </Select>
                {errors.jobType && (
                  <p className="text-red-500 text-xs">{errors.jobType}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleInputChange("status", value as any)
                  }
                >
                  <SelectTrigger
                    className={errors.status ? "border-red-500" : ""}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUEUING">Queuing</SelectItem>
                    <SelectItem value="BAY_QUEUE">Bay Queue</SelectItem>
                    <SelectItem value="NEXT_JOB">Next Job</SelectItem>
                    <SelectItem value="ACTIVE_BOARD">Active Board</SelectItem>
                    <SelectItem value="JOB_STOPPAGE">Job Stoppage</SelectItem>
                    <SelectItem value="REPAIR_COMPLETION">
                      Repair Completion
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-500 text-xs">{errors.status}</p>
                )}
              </div>

              {/* Job Start Time */}
              <div className="space-y-2">
                <Label htmlFor="jobStartTime">Job Start Time (Optional)</Label>
                <Input
                  id="jobStartTime"
                  type="time"
                  value={formData.jobStartTime}
                  onChange={(e) =>
                    handleInputChange("jobStartTime", e.target.value)
                  }
                />
              </div>

              {/* Job End Time */}
              <div className="space-y-2">
                <Label htmlFor="jobEndTime">Job End Time (Optional)</Label>
                <Input
                  id="jobEndTime"
                  type="time"
                  value={formData.jobEndTime}
                  onChange={(e) =>
                    handleInputChange("jobEndTime", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Workflow Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-toyota-black mb-3">
                Workflow Actions
              </h4>
              <div className="flex flex-wrap gap-2">
                {bookingUtils.getNextActions(booking.status).map((action) => (
                  <Button
                    key={action}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (action === "Assign to Bay") {
                        handleAssignToBay();
                      } else if (action === "Move to Next Job") {
                        handleAssignToNextJob();
                      } else if (action === "Start Job") {
                        startJob();
                      } else if (action === "Pause Job") {
                        handlePauseJob();
                      } else if (action === "Complete Job") {
                        handleCompleteJob();
                      } else if (action === "Resume Job") {
                        handleResumeJob();
                      } else {
                        // Handle other workflow actions
                        console.log(
                          `Executing: ${action} for booking ${booking.id}`
                        );
                        onClose();
                      }
                    }}
                    disabled={isLoading}
                    className={
                      action === "Complete Job"
                        ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
                        : action === "Pause Job"
                        ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
                        : action === "Resume Job"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
                        : action === "Assign to Bay"
                        ? "bg-toyota-red text-white hover:bg-toyota-red-dark border-toyota-red"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
                    }
                  >
                    {isLoading && action === "Assign to Bay" ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Assigning...
                      </>
                    ) : (
                      action
                    )}
                  </Button>
                ))}
                {bookingUtils.getNextActions(booking.status).length === 0 && (
                  <span className="text-sm text-gray-500">
                    No actions available
                  </span>
                )}
              </div>

              {/* View History Button */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onViewHistory(booking);
                    onClose();
                  }}
                  className="w-full text-toyota-red border-toyota-red hover:bg-toyota-red hover:text-white"
                >
                  📋 View Process History
                </Button>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-booking-form"
              disabled={isLoading}
              className="bg-toyota-red hover:bg-toyota-red-dark"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingEditModal;
