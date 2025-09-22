"use client";

import React, { useState, useEffect } from "react";
import { Bay, UpdateBayData, bayAPI, bayValidators } from "@/lib/api/bays";
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

interface EditBayModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bay: Bay | null;
}

export default function EditBayModal({
  open,
  onClose,
  onSuccess,
  bay,
}: EditBayModalProps) {
  const [formData, setFormData] = useState<UpdateBayData>({
    bay_name: "",
    bay_no: "",
    bay_status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Update form data when bay changes
  useEffect(() => {
    if (bay) {
      setFormData({
        bay_name: bay.bay_name,
        bay_no: bay.bay_no,
        bay_status: bay.bay_status,
      });
    }
  }, [bay]);

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

    const nameError = bayValidators.bayName(formData.bay_name);
    if (nameError) newErrors.bay_name = nameError;

    const bayNoError = bayValidators.bayNo(formData.bay_no);
    if (bayNoError) newErrors.bay_no = bayNoError;

    const statusError = bayValidators.bayStatus(formData.bay_status);
    if (statusError) newErrors.bay_status = statusError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bay || !validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await bayAPI.updateBay(bay.bay_id, formData);

      if (response.success) {
        onSuccess();
        handleClose();
      } else {
        setApiError(response.message || "Failed to update bay");
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

  if (!bay) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Bay</DialogTitle>
          <DialogDescription>
            Update bay information, number, and status.
          </DialogDescription>
        </DialogHeader>

        <form id="edit-bay-form" onSubmit={handleSubmit} className="space-y-6">
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

          {/* Bay ID (Read-only) */}
          <div className="space-y-2">
            <Label className="text-toyota-text-secondary">Bay ID</Label>
            <Input
              type="text"
              value={bay.bay_id}
              disabled
              className="bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-toyota-text-secondary">
              Bay ID cannot be changed
            </p>
          </div>

          {/* Bay Name Field */}
          <div className="space-y-2">
            <Label htmlFor="bay_name">
              Bay Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bay_name"
              name="bay_name"
              type="text"
              required
              value={formData.bay_name}
              onChange={handleInputChange}
              className={errors.bay_name ? "border-red-500" : ""}
              placeholder="Enter bay name (e.g., Service Bay 1)"
            />
            {errors.bay_name && (
              <p className="text-sm text-red-600">{errors.bay_name}</p>
            )}
          </div>

          {/* Bay Number Field */}
          <div className="space-y-2">
            <Label htmlFor="bay_no">
              Bay Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bay_no"
              name="bay_no"
              type="text"
              required
              value={formData.bay_no}
              onChange={handleInputChange}
              className={errors.bay_no ? "border-red-500" : ""}
              placeholder="Enter bay number (e.g., B-01, Bay A)"
            />
            {errors.bay_no && (
              <p className="text-sm text-red-600">{errors.bay_no}</p>
            )}
          </div>

          {/* Bay Status Field */}
          <div className="space-y-2">
            <Label htmlFor="bay_status">
              Bay Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.bay_status}
              onValueChange={(value) => {
                const event = {
                  target: { name: "bay_status", value },
                } as React.ChangeEvent<HTMLSelectElement>;
                handleInputChange(event);
              }}
            >
              <SelectTrigger
                className={errors.bay_status ? "border-red-500" : ""}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.bay_status && (
              <p className="text-sm text-red-600">{errors.bay_status}</p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-bay-form"
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
              "Update Bay"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
