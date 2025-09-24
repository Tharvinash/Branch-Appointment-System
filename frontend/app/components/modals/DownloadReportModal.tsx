"use client";

import React, { useState } from "react";
import { bookingUtils, Booking } from "@/lib/api/bookings";
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

interface DownloadReportModalProps {
  open: boolean;
  onClose: () => void;
  bookings: Booking[];
}

const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  open,
  onClose,
  bookings,
}) => {
  const [carRegNo, setCarRegNo] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Filter bookings if car reg no is provided
      const filteredBookings = carRegNo.trim()
        ? bookings.filter((b) =>
            b.carRegNo.toLowerCase().includes(carRegNo.toLowerCase()),
          )
        : bookings;

      // Create CSV content
      const csvContent = [
        [
          "Car Registration No",
          "Service Advisor ID",
          "Check-in Date",
          "Promise Date",
          "Job Type",
          "Status",
          "Job Start Time",
          "Job End Time",
          "Bay ID",
          "Job Type",
        ],
        ...filteredBookings.map((booking) => [
          booking.carRegNo,
          booking.serviceAdvisorId,
          new Date(booking.checkinDate).toLocaleDateString(),
          new Date(booking.promiseDate).toLocaleDateString(),
          bookingUtils.getJobTypeText(booking.jobType),
          bookingUtils.getStatusText(booking.status),
          booking.jobStartTime || "",
          booking.jobEndTime || "",
          booking.bayId,
          bookingUtils.getJobTypeText(booking.jobType),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `booking-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error("Failed to download report:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Download Report</DialogTitle>
          <DialogDescription>
            Export booking data to CSV format. Optionally filter by car
            registration number.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="carRegNo">Car Registration Number (Optional)</Label>
            <Input
              id="carRegNo"
              type="text"
              value={carRegNo}
              onChange={(e) => setCarRegNo(e.target.value)}
              placeholder="Leave empty to download all bookings"
            />
            <p className="text-xs text-gray-500">
              {carRegNo.trim()
                ? `Will download bookings for vehicles containing "${carRegNo}"`
                : "Will download all booking information and processes"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-toyota-red hover:bg-toyota-red-dark"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Downloading...
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadReportModal;
