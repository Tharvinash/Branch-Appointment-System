"use client";

import React, { useState, useEffect } from "react";
import { bookingAPI, ProcessStep, Booking } from "@/lib/api/bookings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProcessHistoryModalProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
}

const ProcessHistoryModal: React.FC<ProcessHistoryModalProps> = ({
  open,
  booking,
  onClose,
}) => {
  const [processHistory, setProcessHistory] = useState<ProcessStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProcessHistory = async () => {
      if (!booking?.id) return;

      try {
        const response = await bookingAPI.getBookingHistory(booking.id);
        if (response.success && response.data) {
          setProcessHistory(response.data);
        } else {
          console.error("Failed to fetch process history:", response.message);
          setProcessHistory([]);
        }
      } catch (error) {
        console.error("Failed to fetch process history:", error);
        setProcessHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (booking?.id) {
      fetchProcessHistory();
    }
  }, [booking?.id]);

  // Don't render if booking is null
  if (!booking) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Process History</DialogTitle>
          <DialogDescription>
            Vehicle: {booking.carRegNo} | Service Advisor ID:{" "}
            {booking.serviceAdvisorId}
          </DialogDescription>
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs text-blue-700 font-medium">
                Demo Mode: Showing mock process history data
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-toyota-red"></div>
            </div>
          ) : processHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No process history found for this booking.
            </div>
          ) : (
            <div className="space-y-4">
              {processHistory.map((step, index) => (
                <div
                  key={step.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          step.status === "completed"
                            ? "bg-green-500"
                            : step.status === "started"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="font-medium text-toyota-black">
                        {step.fromStatus} → {step.toStatus}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      Status Change
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Changed At:</span>
                      <span className="font-medium">
                        {new Date(step.changedAt).toLocaleString()}
                      </span>
                    </div>
                    {step.jobStartTime && (
                      <div className="flex justify-between">
                        <span>Job Start:</span>
                        <span className="font-medium">{step.jobStartTime}</span>
                      </div>
                    )}
                    {step.jobEndTime && (
                      <div className="flex justify-between">
                        <span>Job End:</span>
                        <span className="font-medium">{step.jobEndTime}</span>
                      </div>
                    )}
                    {step.fromProcess && (
                      <div className="flex justify-between">
                        <span>From Process:</span>
                        <span className="font-medium">
                          {step.fromProcess.name}
                        </span>
                      </div>
                    )}
                    {step.toProcess && (
                      <div className="flex justify-between">
                        <span>To Process:</span>
                        <span className="font-medium">
                          {step.toProcess.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-toyota-red hover:bg-toyota-red-dark"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessHistoryModal;
