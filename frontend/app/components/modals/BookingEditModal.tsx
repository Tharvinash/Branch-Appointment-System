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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Bay {
  id: string;
  name: string;
  process: string;
  status: "active" | "inactive" | "maintenance";
}

interface BookingEditModalProps {
  open: boolean;
  booking: Booking;
  onClose: () => void;
  onUpdate: (booking: Booking) => void;
  onViewHistory: (booking: Booking) => void;
  processOptions: string[];
  timeSlots: string[];
  bays: Bay[];
}

const BookingEditModal: React.FC<BookingEditModalProps> = ({
  open,
  booking,
  onClose,
  onUpdate,
  onViewHistory,
  processOptions,
  timeSlots,
  bays,
}) => {
  const [formData, setFormData] = useState({
    currentProcess: booking?.currentProcess || "",
    startTime: booking?.startTime || "",
    endTime: booking?.endTime || "",
    bayId: booking?.bayId || "",
  });

  // Don't render if booking is null
  if (!booking) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate duration to maintain the same booking length
    const startIndex = timeSlots.indexOf(booking.startTime);
    const endIndex = timeSlots.indexOf(booking.endTime);
    const duration = endIndex - startIndex;

    const newStartIndex = timeSlots.indexOf(formData.startTime);
    const newEndIndex = newStartIndex + duration;
    const newEndTime =
      timeSlots[newEndIndex] || timeSlots[timeSlots.length - 1];

    const updatedBooking: Booking = {
      ...booking,
      currentProcess: formData.currentProcess,
      startTime: formData.startTime,
      endTime: newEndTime,
      bayId: formData.bayId,
    };

    onUpdate(updatedBooking);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Get available bays for the selected process
  const availableBays = bays.filter(
    (bay) => bay.process === formData.currentProcess
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Update booking details and workflow actions for {booking.vehicleNo}.
          </DialogDescription>
        </DialogHeader>
        {/* Booking Info */}
        <div className="mb-6 p-4 bg-toyota-gray rounded-lg">
          <h4 className="text-sm font-semibold text-toyota-black mb-2">
            Booking Details
          </h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Vehicle:</span> {booking.vehicleNo}
            </div>
            <div>
              <span className="font-medium">SVA:</span> {booking.sva}
            </div>
            <div>
              <span className="font-medium">Check-in:</span>{" "}
              {booking.checkInDate}
            </div>
            <div>
              <span className="font-medium">Promised:</span>{" "}
              {booking.promisedDate}
            </div>
          </div>
        </div>

        <form
          id="edit-booking-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Process Selection */}
          <div className="space-y-2">
            <Label htmlFor="currentProcess">Current Process</Label>
            <Select
              value={formData.currentProcess}
              onValueChange={(value) =>
                handleInputChange("currentProcess", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {processOptions.map((process) => (
                  <SelectItem key={process} value={process}>
                    {process}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bay Selection */}
          <div className="space-y-2">
            <Label htmlFor="bayId">Bay Assignment</Label>
            <Select
              value={formData.bayId}
              onValueChange={(value) => handleInputChange("bayId", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableBays.map((bay) => (
                  <SelectItem key={bay.id} value={bay.id}>
                    {bay.name} - {bay.process}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Select
              value={formData.startTime}
              onValueChange={(value) => handleInputChange("startTime", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* End Time (calculated automatically) */}
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time (Auto-calculated)</Label>
            <Input
              id="endTime"
              type="text"
              value={(() => {
                const startIndex = timeSlots.indexOf(booking.startTime);
                const endIndex = timeSlots.indexOf(booking.endTime);
                const duration = endIndex - startIndex;
                const newStartIndex = timeSlots.indexOf(formData.startTime);
                const newEndIndex = newStartIndex + duration;
                return (
                  timeSlots[newEndIndex] || timeSlots[timeSlots.length - 1]
                );
              })()}
              disabled
              className="bg-gray-100 text-gray-600"
            />
          </div>

          {/* Workflow Actions */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-toyota-black mb-3">
              Workflow Actions
            </h4>
            <div className="flex flex-wrap gap-2">
              {bookingUtils.getNextActions(booking.status).map((action) => (
                <Button
                  key={action}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle workflow action
                    console.log(
                      `Executing: ${action} for booking ${booking.id}`
                    );
                    onClose();
                  }}
                  className={
                    action === "Complete Job"
                      ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
                      : action === "Pause Job"
                      ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
                      : action === "Resume Job"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
                      : "bg-toyota-red text-white hover:bg-toyota-red-dark border-toyota-red"
                  }
                >
                  {action}
                </Button>
              ))}
              {bookingUtils.getNextActions(booking.status).length === 0 && (
                <span className="text-sm text-gray-500">
                  No actions available
                </span>
              )}
            </div>

            {/* View History Button */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onViewHistory(booking);
                  onClose();
                }}
                className="w-full text-toyota-red border-toyota-red hover:bg-toyota-red hover:text-white"
              >
                📋 View Process History
              </Button>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-booking-form"
            className="bg-toyota-red hover:bg-toyota-red-dark"
          >
            Update Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingEditModal;
