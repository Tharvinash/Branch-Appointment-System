"use client";

import React, { useState } from "react";
import { Booking } from "@/lib/api/bookings";
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
  onAdd: (booking: Omit<Booking, "id">) => void;
  processOptions: string[];
}

const AddBookingModal: React.FC<AddBookingModalProps> = ({
  open,
  onClose,
  onAdd,
  processOptions,
}) => {
  const [formData, setFormData] = useState({
    vehicleNo: "",
    checkInDate: "",
    promisedDate: "",
    sva: "",
    currentProcess: "",
    priority: "medium" as "low" | "medium" | "high",
    flow: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleNo.trim()) {
      newErrors.vehicleNo = "Registration number is required";
    }

    if (!formData.checkInDate) {
      newErrors.checkInDate = "Check-in date is required";
    }

    if (!formData.promisedDate) {
      newErrors.promisedDate = "Promised date is required";
    }

    if (!formData.sva.trim()) {
      newErrors.sva = "SVA is required";
    }

    if (!formData.currentProcess) {
      newErrors.currentProcess = "Job start process is required";
    }

    // Validate date logic
    if (formData.checkInDate && formData.promisedDate) {
      const checkInDate = new Date(formData.checkInDate);
      const promisedDate = new Date(formData.promisedDate);

      if (promisedDate < checkInDate) {
        newErrors.promisedDate = "Promised date cannot be before check-in date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create new booking object
    const newBooking: Omit<Booking, "id"> = {
      vehicleNo: formData.vehicleNo.trim(),
      sva: formData.sva.trim(),
      checkInDate: formData.checkInDate,
      promisedDate: formData.promisedDate,
      currentProcess: formData.currentProcess,
      status: "queuing",
      startTime: "08:00", // Default start time
      endTime: "10:00", // Default end time
      bayId: "", // Will be assigned later
      priority: formData.priority,
      flow: formData.flow.trim() || undefined,
    };

    onAdd(newBooking);
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
              <Label htmlFor="vehicleNo">
                Reg No <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vehicleNo"
                type="text"
                value={formData.vehicleNo}
                onChange={(e) => handleInputChange("vehicleNo", e.target.value)}
                placeholder="e.g. VJT3527"
                className={errors.vehicleNo ? "border-red-500" : ""}
              />
              {errors.vehicleNo && (
                <p className="text-red-500 text-xs">{errors.vehicleNo}</p>
              )}
            </div>

            {/* SVA */}
            <div className="space-y-2">
              <Label htmlFor="sva">
                SVA <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sva"
                type="text"
                value={formData.sva}
                onChange={(e) => handleInputChange("sva", e.target.value)}
                placeholder="e.g. Abu"
                className={errors.sva ? "border-red-500" : ""}
              />
              {errors.sva && (
                <p className="text-red-500 text-xs">{errors.sva}</p>
              )}
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-in Date */}
            <div className="space-y-2">
              <Label htmlFor="checkInDate">
                Chk-in Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="checkInDate"
                type="date"
                value={formData.checkInDate}
                onChange={(e) =>
                  handleInputChange("checkInDate", e.target.value)
                }
                className={errors.checkInDate ? "border-red-500" : ""}
              />
              {errors.checkInDate && (
                <p className="text-red-500 text-xs">{errors.checkInDate}</p>
              )}
            </div>

            {/* Promised Date */}
            <div className="space-y-2">
              <Label htmlFor="promisedDate">
                Prom Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="promisedDate"
                type="date"
                value={formData.promisedDate}
                onChange={(e) =>
                  handleInputChange("promisedDate", e.target.value)
                }
                className={errors.promisedDate ? "border-red-500" : ""}
              />
              {errors.promisedDate && (
                <p className="text-red-500 text-xs">{errors.promisedDate}</p>
              )}
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Start Process */}
            <div className="space-y-2">
              <Label htmlFor="currentProcess">
                Job Start (Process) <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.currentProcess}
                onValueChange={(value) =>
                  handleInputChange("currentProcess", value)
                }
              >
                <SelectTrigger
                  className={errors.currentProcess ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {processOptions.map((process) => (
                    <SelectItem key={process} value={process}>
                      {process}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currentProcess && (
                <p className="text-red-500 text-xs">{errors.currentProcess}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Flow (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="flow">Flow (Optional)</Label>
            <Input
              id="flow"
              type="text"
              value={formData.flow}
              onChange={(e) => handleInputChange("flow", e.target.value)}
              placeholder="e.g. SP | SB | QC"
            />
            <p className="text-xs text-gray-500">
              Enter the process flow separated by "|" (e.g., SP | SB | QC)
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-booking-form"
            className="bg-toyota-red hover:bg-toyota-red-dark"
          >
            Add Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookingModal;
