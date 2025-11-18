"use client";

import React, { useState } from "react";
import { bookingAPI } from "@/lib/api/bookings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DelayReasonModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (delayReason: string) => Promise<void>;
  bookingId: number;
  action: "complete" | "changeBay";
}

const DelayReasonModal: React.FC<DelayReasonModalProps> = ({
  open,
  onClose,
  onConfirm,
  bookingId,
  action,
}) => {
  const [delayReason, setDelayReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!delayReason.trim()) {
      setError("Please provide a reason for the delay");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Update delay reason via API
      await bookingAPI.updateDelayReason(bookingId, delayReason.trim());
      
      // Call the onConfirm callback to proceed with the action
      await onConfirm(delayReason.trim());
      handleClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to proceed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDelayReason("");
    setError("");
    onClose();
  };

  const actionText = action === "complete" ? "Complete Job" : "Change Bay";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delay Reason Required</DialogTitle>
          <DialogDescription>
            Please provide a reason for the delay before {actionText.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delayReason">
              Delay Reason <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="delayReason"
              value={delayReason}
              onChange={(e) => {
                setDelayReason(e.target.value);
                if (error) setError("");
              }}
              className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[100px] resize-none"
              placeholder="Enter reason for delay..."
              disabled={isLoading}
            />
          </div>

          {error && (
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
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!delayReason.trim() || isLoading}
            className="btn-toyota-primary text-white"
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
                Processing...
              </>
            ) : (
              actionText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DelayReasonModal;

