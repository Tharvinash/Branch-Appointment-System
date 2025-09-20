"use client";

import React, { useState } from "react";
import {
  CreateTechnicianData,
  technicianAPI,
  technicianValidators,
} from "@/lib/api/technicians";

interface AddTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTechnicianModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTechnicianModalProps) {
  const [formData, setFormData] = useState<CreateTechnicianData>({
    technician_name: "",
    technician_status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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

    const nameError = technicianValidators.technicianName(
      formData.technician_name
    );
    if (nameError) newErrors.technician_name = nameError;

    const statusError = technicianValidators.technicianStatus(
      formData.technician_status
    );
    if (statusError) newErrors.technician_status = statusError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await technicianAPI.createTechnician(formData);

      if (response.success) {
        onSuccess();
        handleClose();
      } else {
        setApiError(response.message || "Failed to create technician");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      technician_name: "",
      technician_status: "active",
    });
    setErrors({});
    setApiError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-toyota-black">
            Add New Technician
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Technician Name Field */}
          <div>
            <label
              htmlFor="technician_name"
              className="block text-sm font-medium text-toyota-black mb-2"
            >
              Technician Name *
            </label>
            <input
              id="technician_name"
              name="technician_name"
              type="text"
              required
              value={formData.technician_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red transition-colors ${
                errors.technician_name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter technician name (e.g., John Smith)"
            />
            {errors.technician_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.technician_name}
              </p>
            )}
          </div>

          {/* Technician Status Field */}
          <div>
            <label
              htmlFor="technician_status"
              className="block text-sm font-medium text-toyota-black mb-2"
            >
              Technician Status *
            </label>
            <select
              id="technician_status"
              name="technician_status"
              required
              value={formData.technician_status}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red transition-colors ${
                errors.technician_status ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="active">Available</option>
              <option value="inactive">On Leave</option>
            </select>
            {errors.technician_status && (
              <p className="mt-1 text-sm text-red-600">
                {errors.technician_status}
              </p>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-toyota-text-secondary hover:text-toyota-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-toyota-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                "Create Technician"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
