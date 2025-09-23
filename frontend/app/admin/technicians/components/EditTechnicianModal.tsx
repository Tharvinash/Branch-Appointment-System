"use client";

import React, { useState, useEffect } from "react";
import {
  Technician,
  UpdateTechnicianData,
  technicianAPI,
  technicianValidators,
} from "@/lib/api/technicians";
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

interface EditTechnicianModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  technician: Technician | null;
}

export default function EditTechnicianModal({
  open,
  onClose,
  onSuccess,
  technician,
}: EditTechnicianModalProps) {
  const [formData, setFormData] = useState<UpdateTechnicianData>({
    name: "",
    status: "AVAILABLE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Update form data when technician changes
  useEffect(() => {
    if (technician) {
      setFormData({
        name: technician.name,
        status: technician.status,
      });
    }
  }, [technician]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = technicianValidators.technicianName(formData.name);
    if (nameError) newErrors.name = nameError;

    const statusError = technicianValidators.technicianStatus(formData.status);
    if (statusError) newErrors.status = statusError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!technician || !validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await technicianAPI.updateTechnician(
        technician.id,
        formData
      );

      if (response.success) {
        onSuccess();
        handleClose();
      } else {
        setApiError(response.message || "Failed to update technician");
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

  if (!technician) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Technician</DialogTitle>
          <DialogDescription>
            Update technician information and status.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-technician-form"
          onSubmit={handleSubmit}
          className="space-y-6"
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

          {/* Technician ID (Read-only) */}
          <div className="space-y-2">
            <Label className="text-toyota-text-secondary">Technician ID</Label>
            <Input
              type="text"
              value={technician.id}
              disabled
              className="bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-toyota-text-secondary">
              Technician ID cannot be changed
            </p>
          </div>

          {/* Technician Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Technician Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-red-500" : ""}
              placeholder="Enter technician name (e.g., John Smith)"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Technician Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Technician Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                const event = {
                  target: { name: "status", value },
                } as React.ChangeEvent<HTMLSelectElement>;
                handleInputChange(event);
              }}
            >
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status}</p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-technician-form"
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
              "Update Technician"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
