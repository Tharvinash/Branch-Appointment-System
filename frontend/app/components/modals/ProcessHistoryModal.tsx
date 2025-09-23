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
  booking: Booking;
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
      try {
        const response = await bookingAPI.processTracking.getProcessHistory(
          booking.id
        );
        if (response.success && response.data) {
          setProcessHistory(response.data);
        } else {
          // Use mock data for demonstration
          setProcessHistory(getMockProcessHistory(booking.id));
        }
      } catch (error) {
        console.error("Failed to fetch process history:", error);
        // Use mock data when API fails
        setProcessHistory(getMockProcessHistory(booking.id));
      } finally {
        setIsLoading(false);
      }
    };

    if (booking?.id) {
      fetchProcessHistory();
    }
  }, [booking?.id]);

  // Mock data generator for demonstration
  const getMockProcessHistory = (bookingId: string): ProcessStep[] => {
    const now = new Date();
    const mockSteps: ProcessStep[] = [
      {
        id: "step-1",
        bookingId: bookingId,
        processName: "Check-in",
        status: "completed",
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        endTime: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
        notes: "Vehicle checked in and initial inspection completed",
        bayId: "Bay 1",
        technicianId: "tech-001",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "step-2",
        bookingId: bookingId,
        processName: "Surface Preparation",
        status: "completed",
        startTime: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
        endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        notes: "Surface cleaned and prepared for painting",
        bayId: "Bay 4",
        technicianId: "tech-002",
        createdAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "step-3",
        bookingId: bookingId,
        processName: "Spray Booth",
        status: "started",
        startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        notes: "Currently in spray booth for painting process",
        bayId: "Bay 5",
        technicianId: "tech-003",
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "step-4",
        bookingId: bookingId,
        processName: "Quality Control",
        status: "paused",
        startTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        notes: "Quality check paused due to material shortage",
        bayId: "Bay 6",
        technicianId: "tech-004",
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: "step-5",
        bookingId: bookingId,
        processName: "Final Inspection",
        status: "paused",
        startTime: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        notes: "Waiting for quality control completion",
        bayId: "Bay 7",
        technicianId: "tech-005",
        createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      },
    ];

    return mockSteps;
  };

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
            Vehicle: {booking.vehicleNo} | SVA: {booking.sva}
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
                        {step.processName}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        step.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : step.status === "started"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span className="font-medium">
                        {new Date(step.startTime).toLocaleString()}
                      </span>
                    </div>
                    {step.endTime && (
                      <div className="flex justify-between">
                        <span>End:</span>
                        <span className="font-medium">
                          {new Date(step.endTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {step.bayId && (
                      <div className="flex justify-between">
                        <span>Bay:</span>
                        <span className="font-medium">{step.bayId}</span>
                      </div>
                    )}
                    {step.technicianId && (
                      <div className="flex justify-between">
                        <span>Technician:</span>
                        <span className="font-medium">{step.technicianId}</span>
                      </div>
                    )}
                    {step.notes && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Notes:</div>
                        <div className="text-sm text-gray-700 italic">
                          {step.notes}
                        </div>
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
