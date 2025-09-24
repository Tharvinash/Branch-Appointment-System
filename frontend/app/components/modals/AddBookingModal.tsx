"use client";

import React, { useState, useEffect } from "react";
import { Booking, bookingAPI, bookingValidators } from "@/lib/api/bookings";
import { serviceAdvisorAPI, ServiceAdvisor } from "@/lib/api/service-advisors";
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

interface AddBookingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBookingModal: React.FC<AddBookingModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    carRegNo: "",
    checkinDate: "",
    promiseDate: "",
    serviceAdvisorId: 0,
    bayId: 0,
    jobType: "MEDIUM" as "LIGHT" | "MEDIUM" | "HEAVY",
    status: "QUEUING" as
      | "QUEUING"
      | "BAY_QUEUE"
      | "NEXT_JOB"
      | "ACTIVE_BOARD"
      | "JOB_STOPPAGE"
      | "REPAIR_COMPLETION",
    jobStartTime: "",
    jobEndTime: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [serviceAdvisors, setServiceAdvisors] = useState<ServiceAdvisor[]>([]);
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (apiError) setApiError("");
  };

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
      const response = await bookingAPI.createBooking({
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
        setApiError(response.message || "Failed to create booking");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch service advisors on component mount
  useEffect(() => {
    const fetchServiceAdvisors = async () => {
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
    };

    if (open) {
      fetchServiceAdvisors();
    }
  }, [open]);

  const handleClose = () => {
    setFormData({
      carRegNo: "",
      checkinDate: "",
      promiseDate: "",
      serviceAdvisorId: 0,
      bayId: 0,
      jobType: "MEDIUM",
      status: "QUEUING",
      jobStartTime: "",
      jobEndTime: "",
    });
    setErrors({});
    setApiError("");
    onClose();
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Check-in</DialogTitle>
          <DialogDescription>
            Add a new booking to the system. Fill in all required fields marked
            with *.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-booking-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="carRegNo">
                Reg No <span className="text-red-500">*</span>
              </Label>
              <Input
                id="carRegNo"
                type="text"
                value={formData.carRegNo}
                onChange={(e) => handleInputChange("carRegNo", e.target.value)}
                placeholder="e.g. VJT3527"
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
                    <SelectItem key={advisor.id} value={advisor.id.toString()}>
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
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-in Date */}
            <div className="space-y-2">
              <Label htmlFor="checkinDate">
                Chk-in Date <span className="text-red-500">*</span>
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
                Prom Date <span className="text-red-500">*</span>
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
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bay ID */}
            <div className="space-y-2">
              <Label htmlFor="bayId">
                Bay ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bayId"
                type="number"
                value={formData.bayId}
                onChange={(e) =>
                  handleInputChange("bayId", parseInt(e.target.value) || 0)
                }
                placeholder="e.g. 1"
                className={errors.bayId ? "border-red-500" : ""}
              />
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
          </div>

          {/* Fourth Row - Optional Time Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="08:00"
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
                placeholder="17:00"
              />
            </div>
          </div>

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
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-booking-form"
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
                Creating...
              </>
            ) : (
              "Add Booking"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookingModal;
