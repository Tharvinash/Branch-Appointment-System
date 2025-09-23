"use client";

import React, { useState } from "react";
import {
  CreateServiceAdvisorData,
  serviceAdvisorAPI,
  serviceAdvisorValidators,
} from "@/lib/api/service-advisors";
// Note: These UI components need to be created or replaced with custom components
// For now, we'll use standard HTML elements with Tailwind styling

interface AddServiceAdvisorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddServiceAdvisorModal({
  open,
  onClose,
  onSuccess,
}: AddServiceAdvisorModalProps) {
  const [formData, setFormData] = useState<CreateServiceAdvisorData>({
    name: "",
    status: "AVAILABLE",
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

    const nameError = serviceAdvisorValidators.name(formData.name);
    if (nameError) newErrors.name = nameError;

    const statusError = serviceAdvisorValidators.status(formData.status);
    if (statusError) newErrors.status = statusError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await serviceAdvisorAPI.createServiceAdvisor(formData);

      if (response.success) {
        onSuccess();
        handleClose();
      } else {
        setApiError(response.message || "Failed to create service advisor");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      status: "AVAILABLE",
    });
    setErrors({});
    setApiError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-toyota-black">
              Add New Service Advisor
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Create a new service advisor account with name and status.
            </p>
          </div>
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

          {/* Service Advisor Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-toyota-black"
            >
              Service Advisor Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter service advisor name (e.g., Sarah Johnson)"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Service Advisor Status Field */}
          <div className="space-y-2">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-toyota-black"
            >
              Service Advisor Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red ${
                errors.status ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="AVAILABLE">Available</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status}</p>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-toyota-text-secondary hover:text-toyota-black transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-toyota-primary px-4 py-2 text-sm flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              "Create Service Advisor"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
