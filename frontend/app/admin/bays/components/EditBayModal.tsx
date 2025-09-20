"use client";

import React, { useState, useEffect } from "react";
import { Bay, UpdateBayData, bayAPI, bayValidators } from "@/lib/api/bays";

interface EditBayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bay: Bay | null;
}

export default function EditBayModal({
  isOpen,
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

  if (!isOpen || !bay) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-toyota-black">Edit Bay</h3>
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

          {/* Bay ID (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-toyota-text-secondary mb-2">
              Bay ID
            </label>
            <input
              type="text"
              value={bay.bay_id}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-toyota-text-secondary">
              Bay ID cannot be changed
            </p>
          </div>

          {/* Bay Name Field */}
          <div>
            <label
              htmlFor="bay_name"
              className="block text-sm font-medium text-toyota-black mb-2"
            >
              Bay Name *
            </label>
            <input
              id="bay_name"
              name="bay_name"
              type="text"
              required
              value={formData.bay_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red transition-colors ${
                errors.bay_name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter bay name (e.g., Service Bay 1)"
            />
            {errors.bay_name && (
              <p className="mt-1 text-sm text-red-600">{errors.bay_name}</p>
            )}
          </div>

          {/* Bay Number Field */}
          <div>
            <label
              htmlFor="bay_no"
              className="block text-sm font-medium text-toyota-black mb-2"
            >
              Bay Number *
            </label>
            <input
              id="bay_no"
              name="bay_no"
              type="text"
              required
              value={formData.bay_no}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red transition-colors ${
                errors.bay_no ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter bay number (e.g., B-01, Bay A)"
            />
            {errors.bay_no && (
              <p className="mt-1 text-sm text-red-600">{errors.bay_no}</p>
            )}
          </div>

          {/* Bay Status Field */}
          <div>
            <label
              htmlFor="bay_status"
              className="block text-sm font-medium text-toyota-black mb-2"
            >
              Bay Status *
            </label>
            <select
              id="bay_status"
              name="bay_status"
              required
              value={formData.bay_status}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red transition-colors ${
                errors.bay_status ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.bay_status && (
              <p className="mt-1 text-sm text-red-600">{errors.bay_status}</p>
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
                  Updating...
                </>
              ) : (
                "Update Bay"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
