"use client";

import React, { useState, useEffect } from "react";
import {
  CreateBayData,
  bayAPI,
  bayValidators,
  BayName,
  Bay,
} from "@/lib/api/bays";
import { technicianAPI, Technician } from "@/lib/api/technicians";
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

interface AddBayModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBayModal({
  open,
  onClose,
  onSuccess,
}: AddBayModalProps) {
  const [formData, setFormData] = useState<CreateBayData>({
    name: { id: 0, name: "" },
    number: "",
    status: "ACTIVE",
    technician: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [bayNames, setBayNames] = useState<BayName[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [bays, setBays] = useState<Bay[]>([]);
  const [isLoadingBayNames, setIsLoadingBayNames] = useState(false);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<
    number | null
  >(null);

  // Fetch bay names, technicians, and existing bays when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        // Fetch bay names
        setIsLoadingBayNames(true);
        try {
          const bayNamesResponse = await bayAPI.getBayNames();
          if (bayNamesResponse.success && bayNamesResponse.data) {
            setBayNames(bayNamesResponse.data);
          } else {
            console.error(
              "Failed to fetch bay names:",
              bayNamesResponse.message
            );
          }
        } catch (error) {
          console.error("Error fetching bay names:", error);
        } finally {
          setIsLoadingBayNames(false);
        }

        // Fetch existing bays to check which technicians are already assigned
        try {
          const baysResponse = await bayAPI.getAllBays();
          if (baysResponse.success && baysResponse.data) {
            setBays(baysResponse.data);
          } else {
            console.error("Failed to fetch bays:", baysResponse.message);
          }
        } catch (error) {
          console.error("Error fetching bays:", error);
        }

        // Fetch technicians
        setIsLoadingTechnicians(true);
        try {
          const techniciansResponse = await technicianAPI.getAllTechnicians();
          if (techniciansResponse.success && techniciansResponse.data) {
            setTechnicians(techniciansResponse.data);
          } else {
            console.error(
              "Failed to fetch technicians:",
              techniciansResponse.message
            );
          }
        } catch (error) {
          console.error("Error fetching technicians:", error);
        } finally {
          setIsLoadingTechnicians(false);
        }
      }
    };

    fetchData();
  }, [open]);

  // Get IDs of technicians already assigned to bays
  const getAssignedTechnicianIds = (): Set<number> => {
    const assignedIds = new Set<number>();
    bays.forEach((bay) => {
      if (bay.technician?.id) {
        assignedIds.add(bay.technician.id);
      }
    });
    return assignedIds;
  };

  // Filter technicians by selected bay name skill and exclude already assigned technicians
  const getAvailableTechnicians = (): Technician[] => {
    const assignedTechnicianIds = getAssignedTechnicianIds();

    // First filter out technicians already assigned to other bays
    let availableTechnicians = technicians.filter(
      (technician) => !assignedTechnicianIds.has(technician.id)
    );

    if (!formData.name || formData.name.id === 0) {
      // If no bay name selected, return all unassigned technicians
      return availableTechnicians;
    }

    // Filter technicians who have the required skill (bay name)
    return availableTechnicians.filter((technician) => {
      if (!technician.jobSkills || technician.jobSkills.length === 0) {
        return false;
      }
      return technician.jobSkills.some(
        (skill) => skill.id === formData.name.id
      );
    });
  };

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

    const nameError = bayValidators.bayName(formData.name.name);
    if (nameError) newErrors.name = nameError;

    const bayNoError = bayValidators.bayNo(formData.number);
    if (bayNoError) newErrors.number = bayNoError;

    const statusError = bayValidators.bayStatus(formData.status);
    if (statusError) newErrors.status = statusError;

    // Validate technician selection
    if (!formData.technician) {
      newErrors.technician = "Technician selection is required";
    } else if (formData.name.id > 0) {
      // Validate that technician has the required skill
      const hasRequiredSkill = formData.technician.jobSkills?.some(
        (skill) => skill.id === formData.name.id
      );
      if (!hasRequiredSkill) {
        newErrors.technician = `Technician "${formData.technician.name}" does not have the required skill "${formData.name.name}". Please assign this skill to the technician first.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await bayAPI.createBay(formData);

      if (response.success) {
        onSuccess();
        handleClose();
      } else {
        // Check if error is about skill mismatch
        const errorMessage = response.message || "Failed to create bay";
        if (errorMessage.includes("does not have the required skill")) {
          setErrors((prev) => ({
            ...prev,
            technician: errorMessage,
          }));
        } else {
          setApiError(errorMessage);
        }
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: { id: 0, name: "" },
      number: "",
      status: "ACTIVE",
      technician: undefined,
    });
    setSelectedTechnicianId(null);
    setErrors({});
    setApiError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Bay</DialogTitle>
          <DialogDescription>
            Create a new bay with name, number, and status.
          </DialogDescription>
        </DialogHeader>

        <form id="add-bay-form" onSubmit={handleSubmit} className="space-y-6">
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

          {/* Bay Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Bay Name <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.name.id > 0 ? formData.name.id.toString() : ""}
              onValueChange={(value) => {
                const selectedBayName = bayNames.find(
                  (bayName) => bayName.id.toString() === value
                );
                if (selectedBayName) {
                  setFormData((prev) => ({ ...prev, name: selectedBayName }));

                  // Clear selected technician if they don't have the required skill
                  if (formData.technician) {
                    const hasRequiredSkill =
                      formData.technician.jobSkills?.some(
                        (skill) => skill.id === selectedBayName.id
                      );
                    if (!hasRequiredSkill) {
                      setFormData((prev) => ({
                        ...prev,
                        technician: undefined,
                      }));
                      setSelectedTechnicianId(null);
                    }
                  }
                }
                // Clear error when user selects
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: "" }));
                }
                if (apiError) setApiError("");
              }}
            >
              <SelectTrigger
                className={`w-full ${errors.name ? "border-red-500" : ""}`}
                disabled={isLoadingBayNames}
              >
                <SelectValue
                  placeholder={
                    isLoadingBayNames
                      ? "Loading bay names..."
                      : "Select bay name"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {bayNames.map((bayName) => (
                  <SelectItem key={bayName.id} value={bayName.id.toString()}>
                    {bayName.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Bay Number Field */}
          <div className="space-y-2">
            <Label htmlFor="number">
              Bay Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="number"
              name="number"
              type="text"
              required
              value={formData.number}
              onChange={handleInputChange}
              className={`w-full ${errors.number ? "border-red-500" : ""}`}
              placeholder="Enter bay number (e.g., B-01, Bay A)"
            />
            {errors.number && (
              <p className="text-sm text-red-600">{errors.number}</p>
            )}
          </div>

          {/* Bay Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Bay Status <span className="text-red-500">*</span>
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
              <SelectTrigger
                className={`w-full ${errors.status ? "border-red-500" : ""}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status}</p>
            )}
          </div>

          {/* Technician Field */}
          <div className="space-y-2">
            <Label htmlFor="technician">
              Assign Technician <span className="text-red-500">*</span>
            </Label>
            {formData.name.id === 0 ? (
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
                Please select a bay name first to see available technicians
              </div>
            ) : (
              <>
                <Select
                  value={selectedTechnicianId?.toString() || ""}
                  onValueChange={(value) => {
                    const technicianId = value ? parseInt(value) : null;
                    setSelectedTechnicianId(technicianId);
                    const selectedTechnician = technicians.find(
                      (t) => t.id === technicianId
                    );
                    setFormData((prev) => ({
                      ...prev,
                      technician: selectedTechnician || undefined,
                    }));
                    // Clear error when user selects
                    if (errors.technician) {
                      setErrors((prev) => ({ ...prev, technician: "" }));
                    }
                    if (apiError) setApiError("");
                  }}
                >
                  <SelectTrigger
                    className={`w-full ${
                      errors.technician ? "border-red-500" : ""
                    }`}
                    disabled={isLoadingTechnicians}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingTechnicians
                          ? "Loading technicians..."
                          : "Select technician"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTechnicians().length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        No technicians available with required skill
                      </div>
                    ) : (
                      getAvailableTechnicians().map((technician) => (
                        <SelectItem
                          key={technician.id}
                          value={technician.id.toString()}
                        >
                          {technician.name} ({technician.status})
                          {technician.jobSkills &&
                            technician.jobSkills.length > 0 && (
                              <span className="text-xs text-gray-500 ml-1">
                                - {technician.jobSkills.length} skill(s)
                              </span>
                            )}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {getAvailableTechnicians().length === 0 &&
                  formData.name.id > 0 && (
                    <p className="text-sm text-amber-600">
                      No technicians have the required skill "
                      {formData.name.name}". Please assign this skill to a
                      technician first.
                    </p>
                  )}
                {errors.technician && (
                  <p className="text-sm text-red-600">{errors.technician}</p>
                )}
              </>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-bay-form"
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
              "Create Bay"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
