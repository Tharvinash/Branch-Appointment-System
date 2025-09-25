"use client";

import React, { useState, useEffect } from "react";
import { bookingAPI, StoppageReason } from "@/lib/api/bookings";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoppageReasonModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reasonId: number) => void;
  bookingId: number;
}

const StoppageReasonModal: React.FC<StoppageReasonModalProps> = ({
  open,
  onClose,
  onConfirm,
  bookingId,
}) => {
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [stoppageReasons, setStoppageReasons] = useState<StoppageReason[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);
  const [error, setError] = useState("");

  // Fetch stoppage reasons when modal opens
  useEffect(() => {
    const fetchStoppageReasons = async () => {
      if (!open) return;

      setIsLoadingReasons(true);
      setError("");

      try {
        const response = await bookingAPI.getStoppageReasons();
        if (response.success && response.data) {
          setStoppageReasons(response.data);
        } else {
          setError(response.message || "Failed to fetch stoppage reasons");
        }
      } catch (error) {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoadingReasons(false);
      }
    };

    fetchStoppageReasons();
  }, [open]);

  const handleConfirm = async () => {
    if (!selectedReasonId) {
      setError("Please select a reason for stoppage");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onConfirm(selectedReasonId);
      handleClose();
    } catch (error) {
      setError("Failed to pause job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReasonId(null);
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Reason for Stoppage</DialogTitle>
          <DialogDescription>
            Please select a reason for pausing the job for booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stoppageReason">
              Stoppage Reason <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedReasonId?.toString() || ""}
              onValueChange={(value) => setSelectedReasonId(parseInt(value))}
              disabled={isLoadingReasons}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingReasons ? "Loading reasons..." : "Select a reason"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {stoppageReasons.length > 0 ? (
                  stoppageReasons.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id.toString()}>
                      {reason.reasonName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-reasons" disabled>
                    No reasons available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
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
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedReasonId || isLoading || isLoadingReasons}
            className="bg-red-600 hover:bg-red-700 text-white"
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
                Pausing...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoppageReasonModal;
