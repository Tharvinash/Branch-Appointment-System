"use client";

import React, { useState } from "react";
import { ServiceAdvisor, serviceAdvisorAPI } from "@/lib/api/service-advisors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteServiceAdvisorDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceAdvisor: ServiceAdvisor | null;
}

export default function DeleteServiceAdvisorDialog({
  open,
  onClose,
  onSuccess,
  serviceAdvisor,
}: DeleteServiceAdvisorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleDelete = async () => {
    if (!serviceAdvisor) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await serviceAdvisorAPI.deleteServiceAdvisor(
        serviceAdvisor.service_advisor_id
      );

      if (response.success) {
        onSuccess();
        handleClose();
      } else {
        setApiError(response.message || "Failed to delete service advisor");
      }
    } catch (error) {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setApiError("");
    onClose();
  };

  if (!serviceAdvisor) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Service Advisor</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The service advisor will be
            permanently removed from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Error Alert */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
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

          {/* Warning Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Confirmation Message */}
          <div className="text-center">
            <h4 className="text-lg font-medium text-toyota-black mb-2">
              Are you sure you want to delete this Service Advisor?
            </h4>
            <p className="text-toyota-text-secondary mb-6">
              This action cannot be undone. The service advisor will be
              permanently removed from the system.
            </p>

            {/* Service Advisor Details */}
            <div className="bg-toyota-gray rounded-lg p-4 mb-6">
              <div className="text-sm text-toyota-text-secondary mb-2">
                Service Advisor Details:
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-toyota-black">ID:</span>
                  <span className="text-toyota-black">
                    {serviceAdvisor.service_advisor_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-toyota-black">Name:</span>
                  <span className="text-toyota-black">
                    {serviceAdvisor.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-toyota-black">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      serviceAdvisor.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {serviceAdvisor.status === "active"
                      ? "Available"
                      : "On Leave"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
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
                Deleting...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Service Advisor
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
