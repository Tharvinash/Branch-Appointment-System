"use client";

import React, { useState, useEffect } from "react";
import {
  Technician,
  UpdateTechnicianData,
  technicianAPI,
  technicianValidators,
} from "@/lib/api/technicians";
import { reasonAPI, Reason } from "@/lib/api/reasons";
import { bayAPI, BayName } from "@/lib/api/bays";
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
    reason: null,
    jobSkills: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [bayNames, setBayNames] = useState<BayName[]>([]);
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);
  const [isLoadingBayNames, setIsLoadingBayNames] = useState(false);
  const [selectedJobSkills, setSelectedJobSkills] = useState<number[]>([]);

  // Fetch reasons and bay names when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        // Fetch reasons
        setIsLoadingReasons(true);
        try {
          const reasonsResponse = await reasonAPI.getAllReasons();
          if (reasonsResponse.success && reasonsResponse.data) {
            setReasons(reasonsResponse.data);
          }
        } catch (error) {
          console.error("Error fetching reasons:", error);
        } finally {
          setIsLoadingReasons(false);
        }

        // Fetch bay names for job skills
        setIsLoadingBayNames(true);
        try {
          const bayNamesResponse = await bayAPI.getBayNames();
          if (bayNamesResponse.success && bayNamesResponse.data) {
            setBayNames(bayNamesResponse.data);
          }
        } catch (error) {
          console.error("Error fetching bay names:", error);
        } finally {
          setIsLoadingBayNames(false);
        }
      }
    };

    fetchData();
  }, [open]);

  // Update form data when technician changes
  useEffect(() => {
    if (technician) {
      setFormData({
        name: technician.name,
        status: technician.status,
        reason: technician.reason ? { id: technician.reason.id } : null,
        jobSkills: technician.jobSkills
          ? technician.jobSkills.map((skill) => ({ id: skill.id }))
          : [],
      });
      setSelectedJobSkills(
        technician.jobSkills
          ? technician.jobSkills.map((skill) => skill.id)
          : []
      );
    }
  }, [technician]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as "AVAILABLE" | "ON_LEAVE",
      reason: value === "AVAILABLE" ? null : prev.reason,
    }));
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: "" }));
    }
    if (apiError) setApiError("");
  };

  const handleReasonChange = (reasonId: string) => {
    if (reasonId) {
      setFormData((prev) => ({
        ...prev,
        reason: { id: parseInt(reasonId) },
      }));
    } else {
      setFormData((prev) => ({ ...prev, reason: null }));
    }
    if (errors.reason) {
      setErrors((prev) => ({ ...prev, reason: "" }));
    }
  };

  const handleJobSkillToggle = (bayNameId: number) => {
    setSelectedJobSkills((prev) => {
      if (prev.includes(bayNameId)) {
        const updated = prev.filter((id) => id !== bayNameId);
        setFormData((prevData) => ({
          ...prevData,
          jobSkills: updated.map((id) => ({ id })),
        }));
        return updated;
      } else {
        const updated = [...prev, bayNameId];
        setFormData((prevData) => ({
          ...prevData,
          jobSkills: updated.map((id) => ({ id })),
        }));
        return updated;
      }
    });
    if (errors.jobSkills) {
      setErrors((prev) => ({ ...prev, jobSkills: "" }));
    }
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
      // Prepare data for API
      const submitData: UpdateTechnicianData = {
        name: formData.name,
        status: formData.status,
        reason: formData.status === "ON_LEAVE" ? formData.reason : null,
        jobSkills: selectedJobSkills.length > 0
          ? selectedJobSkills.map((id) => ({ id }))
          : [],
      };

      const response = await technicianAPI.updateTechnician(
        technician.id,
        submitData,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Technician</DialogTitle>
          <DialogDescription>
            Update technician information, status, reason, and job skills.
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
            <Select value={formData.status} onValueChange={handleStatusChange}>
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

          {/* Reason Field - Only shown when status is ON_LEAVE */}
          {formData.status === "ON_LEAVE" && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for Leave <span className="text-gray-500">(Optional)</span>
              </Label>
              <Select
                value={formData.reason?.id.toString() || ""}
                onValueChange={handleReasonChange}
              >
                <SelectTrigger
                  className={errors.reason ? "border-red-500" : ""}
                  disabled={isLoadingReasons}
                >
                  <SelectValue
                    placeholder={
                      isLoadingReasons
                        ? "Loading reasons..."
                        : "Select reason (optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {reasons.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id.toString()}>
                      {reason.reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason}</p>
              )}
            </div>
          )}

          {/* Job Skills Field */}
          <div className="space-y-2">
            <Label>
              Job Skills <span className="text-gray-500">(Optional)</span>
            </Label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
              {isLoadingBayNames ? (
                <p className="text-sm text-gray-500">Loading bay names...</p>
              ) : bayNames.length === 0 ? (
                <p className="text-sm text-gray-500">No bay names available</p>
              ) : (
                <div className="space-y-2">
                  {bayNames.map((bayName) => (
                    <label
                      key={bayName.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedJobSkills.includes(bayName.id)}
                        onChange={() => handleJobSkillToggle(bayName.id)}
                        className="rounded border-gray-300 text-toyota-red focus:ring-toyota-red"
                      />
                      <span className="text-sm">{bayName.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {errors.jobSkills && (
              <p className="text-sm text-red-600">{errors.jobSkills}</p>
            )}
            {selectedJobSkills.length > 0 && (
              <p className="text-xs text-gray-500">
                {selectedJobSkills.length} skill(s) selected
              </p>
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
