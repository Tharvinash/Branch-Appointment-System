"use client";

import React, { useState, useEffect } from "react";
import {
  bookingUtils,
  Booking,
  bookingAPI,
  bookingValidators,
  TimeExtension,
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
    jobType: booking?.jobType || ("MEDIUM" as "LIGHT" | "MEDIUM" | "HEAVY" | "WINDScreen"),
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
  const [isExtendTimeModalOpen, setIsExtendTimeModalOpen] = useState(false);
  const [newEndTime, setNewEndTime] = useState("");
  const [extendTimeReason, setExtendTimeReason] = useState("");
  const [timeExtensions, setTimeExtensions] = useState<TimeExtension[]>([]);
  const [isLoadingExtensions, setIsLoadingExtensions] = useState(false);
  const [delayReason, setDelayReason] = useState("");
  const [showDelayReasonInput, setShowDelayReasonInput] = useState(false);
  const [extendTimeError, setExtendTimeError] = useState("");
  const [isExtendingTime, setIsExtendingTime] = useState(false);
  const [isChangeBayModalOpen, setIsChangeBayModalOpen] = useState(false);
  const [changeBayForm, setChangeBayForm] = useState({
    bayId: 0,
    jobStartTime: "",
    jobEndTime: "",
  });
  const [changeBayErrors, setChangeBayErrors] = useState<
    Record<string, string>
  >({});
  const [isChangingBay, setIsChangingBay] = useState(false);

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
      // Fetch time extensions when modal opens
      if (booking) {
        fetchTimeExtensions();
      }
    }
  }, [open, booking]);

  // Fetch time extensions
  const fetchTimeExtensions = async () => {
    if (!booking) return;
    setIsLoadingExtensions(true);
    try {
      const response = await bookingAPI.getTimeExtensions(booking.id);
      if (response.success && response.data) {
        setTimeExtensions(response.data);
      }
    } catch (error) {
      console.error("Error fetching time extensions:", error);
    } finally {
      setIsLoadingExtensions(false);
    }
  };

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

    // Show delay reason input if job was extended and moving to next bay/process
    if (timeExtensions.length > 0 && !delayReason.trim()) {
      setShowDelayReasonInput(true);
      setApiError(
        "Please provide a reason for the delay before moving to next job."
      );
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // Update delay reason if provided
      if (delayReason.trim()) {
        await bookingAPI.updateDelayReason(booking.id, delayReason.trim());
      }

      const response = await bookingAPI.workflow.moveToNextJob(
        booking.id,
        formData.bayId
      );

      if (response.success) {
        setDelayReason("");
        setShowDelayReasonInput(false);
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

    // Show delay reason input if job was extended
    if (timeExtensions.length > 0 && !delayReason.trim()) {
      setShowDelayReasonInput(true);
      setApiError(
        "Please provide a reason for the delay before completing the job."
      );
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // Update delay reason if provided
      if (delayReason.trim()) {
        await bookingAPI.updateDelayReason(booking.id, delayReason.trim());
      }

      const response = await bookingAPI.workflow.completeJob(booking.id);

      if (response.success) {
        setDelayReason("");
        setShowDelayReasonInput(false);
        onSuccess();
      } else {
        setApiError(response.message || "Failed to complete job");
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
        setApiError(response.message || "Failed to resume job");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtendTime = async () => {
    if (!booking || !newEndTime) {
      setExtendTimeError("Please select a new end time");
      return;
    }

    // Validate that reason is provided
    if (!extendTimeReason.trim()) {
      setExtendTimeError("Please provide a reason for extending the time");
      return;
    }

    // Validate that new end time is after current end time
    if (booking.jobEndTime) {
      const currentTime = booking.jobEndTime.slice(0, 5); // HH:mm
      const [currentHour, currentMin] = currentTime.split(":").map(Number);
      const [newHour, newMin] = newEndTime.split(":").map(Number);

      const currentMinutes = currentHour * 60 + currentMin;
      const newMinutes = newHour * 60 + newMin;

      if (newMinutes <= currentMinutes) {
        setExtendTimeError("New end time must be after the current end time");
        return;
      }
    }

    setIsExtendingTime(true);
    setExtendTimeError("");

    try {
      // Format time to HH:mm:ss
      const timeParts = newEndTime.split(":");
      const formattedTime = `${timeParts[0]}:${timeParts[1]}:00`;

      const response = await bookingAPI.extendTime(
        booking.id,
        formattedTime,
        "Job Controller",
        extendTimeReason.trim()
      );

      if (response.success && response.data) {
        setNewEndTime("");
        setExtendTimeReason("");
        setExtendTimeError("");
        setIsExtendTimeModalOpen(false);
        await fetchTimeExtensions();
        onSuccess(); // Refresh booking data
      } else {
        setExtendTimeError(response.message || "Failed to extend time");
      }
    } catch (error) {
      setExtendTimeError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsExtendingTime(false);
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

  const handleChangeBay = async () => {
    if (!booking) return;

    // Show delay reason input if job was extended
    if (timeExtensions.length > 0 && !delayReason.trim()) {
      setShowDelayReasonInput(true);
      setApiError(
        "Please provide a reason for the delay before changing bay."
      );
      return;
    }

    // Validate form
    const errors: Record<string, string> = {};
    if (!changeBayForm.bayId || changeBayForm.bayId === 0) {
      errors.bayId = "Please select a bay";
    }
    if (!changeBayForm.jobStartTime) {
      errors.jobStartTime = "Please select a start time";
    }
    if (!changeBayForm.jobEndTime) {
      errors.jobEndTime = "Please select an end time";
    }

    // Validate that end time is after start time
    if (changeBayForm.jobStartTime && changeBayForm.jobEndTime) {
      const [startHour, startMin] = changeBayForm.jobStartTime
        .split(":")
        .map(Number);
      const [endHour, endMin] = changeBayForm.jobEndTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        errors.jobEndTime = "End time must be after start time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setChangeBayErrors(errors);
      return;
    }

    setIsChangingBay(true);
    setChangeBayErrors({});
    setApiError("");

    try {
      // Update delay reason if provided
      if (delayReason.trim()) {
        await bookingAPI.updateDelayReason(booking.id, delayReason.trim());
      }

      // Format times to HH:mm:ss
      const startTimeParts = changeBayForm.jobStartTime.split(":");
      const endTimeParts = changeBayForm.jobEndTime.split(":");
      const formattedStartTime = `${startTimeParts[0]}:${startTimeParts[1]}:00`;
      const formattedEndTime = `${endTimeParts[0]}:${endTimeParts[1]}:00`;

      // Get current booking data
      const currentBooking = await bookingAPI.getBooking(booking.id);
      if (!currentBooking.success || !currentBooking.data) {
        setChangeBayErrors({ general: "Failed to fetch current booking data" });
        return;
      }

      // Update booking with new bay and times
      const updateData = {
        ...currentBooking.data,
        bayId: changeBayForm.bayId,
        jobStartTime: formattedStartTime,
        jobEndTime: formattedEndTime,
      };

      const response = await bookingAPI.updateBooking(booking.id, updateData);

      if (response.success) {
        setDelayReason("");
        setShowDelayReasonInput(false);
        setIsChangeBayModalOpen(false);
        setChangeBayForm({ bayId: 0, jobStartTime: "", jobEndTime: "" });
        setChangeBayErrors({});
        onSuccess(); // Refresh booking data
      } else {
        setChangeBayErrors({
          general: response.message || "Failed to change bay",
        });
      }
    } catch (error) {
      setChangeBayErrors({
        general: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsChangingBay(false);
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
                  <span className="text-toyota-red font-medium">
                    {booking.stoppageReason}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div className="bg-toyota-gray border border-gray-300 text-toyota-red px-4 py-3 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-toyota-red"
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

          {/* Conditional Form Fields - Only show for NEXT_JOB status */}
          {booking.status === "NEXT_JOB" && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-toyota-black mb-3">
                Job Configuration
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bay Selection */}
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
                        placeholder={
                          isLoadingBays ? "Loading..." : "Select Bay"
                        }
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

                {/* Job Start Time */}
                <div className="space-y-2">
                  <Label htmlFor="jobStartTime">Job Start Time</Label>
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
                  <Label htmlFor="jobEndTime">Job End Time</Label>
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
            </div>
          )}

          {/* COMMENTED OUT - Original form fields for future use */}
          {/*
          <form
            id="edit-booking-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="jobType">
                  Job Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(value) =>
                    handleInputChange(
                      "jobType",
                      value as "LIGHT" | "MEDIUM" | "HEAVY" | "WINDScreen",
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
                    <SelectItem value="WINDScreen">Windscreen</SelectItem>
                  </SelectContent>
                </Select>
                {errors.jobType && (
                  <p className="text-red-500 text-xs">{errors.jobType}</p>
                )}
              </div>

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
            </div>
          </form>
          */}

          {/* Time Extension Section - Show for ACTIVE_BOARD status */}
          {booking.status === "ACTIVE_BOARD" && booking.jobEndTime && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-toyota-black mb-3">
                Time Management
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-toyota-gray rounded-lg">
                  <div>
                    <div className="text-xs text-toyota-text-secondary">
                      Current End Time
                    </div>
                    <div className="text-sm font-semibold text-toyota-black">
                      {booking.jobEndTime.slice(0, 5)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExtendTimeModalOpen(true)}
                    className="btn-toyota-outline"
                  >
                    ⏰ Extend Time
                  </Button>
                </div>

                {/* Time Extensions History */}
                {timeExtensions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-toyota-text-secondary">
                      Extension History:
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {timeExtensions.map((ext) => (
                        <div
                          key={ext.id}
                          className="text-xs p-2 bg-toyota-gray rounded border border-gray-200"
                        >
                          <div className="flex justify-between mb-1">
                            <span className="text-toyota-text-secondary font-medium">
                              {ext.previousEndTime.slice(0, 5)} →{" "}
                              {ext.newEndTime.slice(0, 5)}
                            </span>
                            <span className="text-toyota-text-secondary text-xs">
                              {new Date(ext.extendedAt).toLocaleString()}
                            </span>
                          </div>
                          {ext.reason && (
                            <div className="text-toyota-black mt-1 italic">
                              Reason: {ext.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delay Reason Input - Show when completing job with extensions */}
          {showDelayReasonInput && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-toyota-black mb-3">
                Delay Reason Required
              </h4>
              <div className="space-y-2">
                <Label htmlFor="delayReason">
                  Please provide a reason for the delay{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="delayReason"
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[80px]"
                  placeholder="Enter reason for delay..."
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCompleteJob}
                    disabled={!delayReason.trim() || isLoading}
                    className="btn-toyota-primary text-white"
                  >
                    Complete with Reason
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDelayReasonInput(false);
                      setDelayReason("");
                      setApiError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Actions */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-toyota-black mb-3">
              Workflow Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              {/* Change Bay button - Show for ACTIVE_BOARD status */}
              {booking.status === "ACTIVE_BOARD" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Initialize form with current booking data
                    setChangeBayForm({
                      bayId: booking.bayId || 0,
                      jobStartTime: booking.jobStartTime?.slice(0, 5) || "",
                      jobEndTime: booking.jobEndTime?.slice(0, 5) || "",
                    });
                    setChangeBayErrors({});
                    setIsChangeBayModalOpen(true);
                  }}
                  disabled={isLoading}
                  className="btn-toyota-outline"
                >
                  Change Bay
                </Button>
              )}
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
                      // Check if time was extended, show delay reason input
                      if (timeExtensions.length > 0) {
                        setShowDelayReasonInput(true);
                      } else {
                        handleCompleteJob();
                      }
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
                      ? "btn-toyota-outline"
                      : action === "Pause Job"
                      ? "bg-toyota-gray-dark text-toyota-black hover:bg-gray-300 border-gray-300"
                      : action === "Resume Job"
                      ? "btn-toyota-outline"
                      : action === "Assign to Bay"
                      ? "btn-toyota-primary text-white"
                      : "bg-toyota-gray text-toyota-black hover:bg-toyota-gray-dark border-gray-300"
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
                <span className="text-sm text-toyota-text-secondary">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
            {/* COMMENTED OUT - Update button for future use */}
            {/*
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
            */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Time Modal */}
      <Dialog
        open={isExtendTimeModalOpen}
        onOpenChange={(open) => {
          setIsExtendTimeModalOpen(open);
          if (!open) {
            // Reset state when modal closes
            setNewEndTime("");
            setExtendTimeReason("");
            setExtendTimeError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Extend Production</DialogTitle>
            <DialogDescription>
              Extend the promise time for booking {booking?.carRegNo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEndTime">
                New Promise Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newEndTime"
                type="time"
                value={newEndTime}
                onChange={(e) => {
                  setNewEndTime(e.target.value);
                  setExtendTimeError(""); // Clear error when user types
                }}
                min={booking?.jobEndTime?.slice(0, 5) || "08:00"}
                max="19:00"
                disabled={isExtendingTime}
              />
              {booking?.jobEndTime && (
                <p className="text-xs text-gray-500">
                  Current end time: {booking.jobEndTime.slice(0, 5)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="extendTimeReason">
                Reason for Extension <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="extendTimeReason"
                value={extendTimeReason}
                onChange={(e) => {
                  setExtendTimeReason(e.target.value);
                  setExtendTimeError(""); // Clear error when user types
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[80px] resize-y"
                placeholder="Enter reason for extending the time..."
                disabled={isExtendingTime}
              />
            </div>
            {extendTimeError && (
              <div className="bg-toyota-gray border border-gray-300 text-toyota-red px-4 py-3 rounded-lg text-sm">
                {extendTimeError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsExtendTimeModalOpen(false);
                setNewEndTime("");
                setExtendTimeReason("");
                setExtendTimeError("");
              }}
              disabled={isExtendingTime}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExtendTime}
              disabled={
                !newEndTime || !extendTimeReason.trim() || isExtendingTime
              }
              className="btn-toyota-primary disabled:opacity-50"
            >
              {isExtendingTime ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                  Extending...
                </>
              ) : (
                "Extend Time"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Bay Modal */}
      <Dialog
        open={isChangeBayModalOpen}
        onOpenChange={(open) => {
          setIsChangeBayModalOpen(open);
          if (!open) {
            // Reset state when modal closes
            setChangeBayForm({ bayId: 0, jobStartTime: "", jobEndTime: "" });
            setChangeBayErrors({});
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Bay</DialogTitle>
            <DialogDescription>
              Move booking {booking?.carRegNo} to a different bay with new time
              slots
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Bay Selection */}
            <div className="space-y-2">
              <Label htmlFor="changeBayId">
                Bay Name <span className="text-red-500">*</span>
              </Label>
              <Select
                value={changeBayForm.bayId.toString()}
                onValueChange={(value) => {
                  setChangeBayForm((prev) => ({
                    ...prev,
                    bayId: parseInt(value),
                  }));
                  if (changeBayErrors.bayId) {
                    setChangeBayErrors((prev) => ({ ...prev, bayId: "" }));
                  }
                }}
                disabled={isChangingBay || isLoadingBays}
              >
                <SelectTrigger
                  className={changeBayErrors.bayId ? "border-red-500" : ""}
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
              {changeBayErrors.bayId && (
                <p className="text-red-500 text-xs">{changeBayErrors.bayId}</p>
              )}
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="changeStartTime">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="changeStartTime"
                type="time"
                value={changeBayForm.jobStartTime}
                onChange={(e) => {
                  setChangeBayForm((prev) => ({
                    ...prev,
                    jobStartTime: e.target.value,
                  }));
                  if (changeBayErrors.jobStartTime) {
                    setChangeBayErrors((prev) => ({
                      ...prev,
                      jobStartTime: "",
                    }));
                  }
                }}
                min="08:00"
                max="19:00"
                disabled={isChangingBay}
                className={changeBayErrors.jobStartTime ? "border-red-500" : ""}
              />
              {changeBayErrors.jobStartTime && (
                <p className="text-red-500 text-xs">
                  {changeBayErrors.jobStartTime}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="changeEndTime">
                End Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="changeEndTime"
                type="time"
                value={changeBayForm.jobEndTime}
                onChange={(e) => {
                  setChangeBayForm((prev) => ({
                    ...prev,
                    jobEndTime: e.target.value,
                  }));
                  if (changeBayErrors.jobEndTime) {
                    setChangeBayErrors((prev) => ({
                      ...prev,
                      jobEndTime: "",
                    }));
                  }
                }}
                min={changeBayForm.jobStartTime || "08:00"}
                max="19:00"
                disabled={isChangingBay}
                className={changeBayErrors.jobEndTime ? "border-red-500" : ""}
              />
              {changeBayErrors.jobEndTime && (
                <p className="text-red-500 text-xs">
                  {changeBayErrors.jobEndTime}
                </p>
              )}
            </div>

            {/* General Error */}
            {changeBayErrors.general && (
              <div className="bg-toyota-gray border border-gray-300 text-toyota-red px-4 py-3 rounded-lg text-sm">
                {changeBayErrors.general}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsChangeBayModalOpen(false);
                setChangeBayForm({
                  bayId: 0,
                  jobStartTime: "",
                  jobEndTime: "",
                });
                setChangeBayErrors({});
              }}
              disabled={isChangingBay}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleChangeBay}
              disabled={
                !changeBayForm.bayId ||
                !changeBayForm.jobStartTime ||
                !changeBayForm.jobEndTime ||
                isChangingBay
              }
              className="btn-toyota-primary disabled:opacity-50"
            >
              {isChangingBay ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                  Changing...
                </>
              ) : (
                "Change Bay"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingEditModal;
