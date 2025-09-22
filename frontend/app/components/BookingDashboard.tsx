"use client";

import React, { useState, useEffect } from "react";
import {
  bookingAPI,
  bookingUtils,
  Booking,
  ProcessStep,
} from "@/lib/api/bookings";

interface Bay {
  id: string;
  name: string;
  process: string;
  status: "active" | "inactive" | "maintenance";
}

interface BookingEditModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdate: (booking: Booking) => void;
  onViewHistory: (booking: Booking) => void;
  processOptions: string[];
  timeSlots: string[];
  bays: Bay[];
}

const BookingEditModal: React.FC<BookingEditModalProps> = ({
  booking,
  onClose,
  onUpdate,
  onViewHistory,
  processOptions,
  timeSlots,
  bays,
}) => {
  const [formData, setFormData] = useState({
    currentProcess: booking.currentProcess,
    startTime: booking.startTime,
    endTime: booking.endTime,
    bayId: booking.bayId,
  });

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
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-toyota-black">
            Edit Booking
          </h3>
          <button
            onClick={onClose}
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
        <div className="p-6">
          {/* Booking Info */}
          <div className="mb-6 p-4 bg-toyota-gray rounded-lg">
            <h4 className="text-sm font-semibold text-toyota-black mb-2">
              Booking Details
            </h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Vehicle:</span>{" "}
                {booking.vehicleNo}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Process Selection */}
            <div>
              <label className="block text-sm font-medium text-toyota-black mb-2">
                Current Process
              </label>
              <select
                value={formData.currentProcess}
                onChange={(e) =>
                  handleInputChange("currentProcess", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red"
              >
                {processOptions.map((process) => (
                  <option key={process} value={process}>
                    {process}
                  </option>
                ))}
              </select>
            </div>

            {/* Bay Selection */}
            <div>
              <label className="block text-sm font-medium text-toyota-black mb-2">
                Bay Assignment
              </label>
              <select
                value={formData.bayId}
                onChange={(e) => handleInputChange("bayId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red"
              >
                {availableBays.map((bay) => (
                  <option key={bay.id} value={bay.id}>
                    {bay.name} - {bay.process}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-toyota-black mb-2">
                Start Time
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* End Time (calculated automatically) */}
            <div>
              <label className="block text-sm font-medium text-toyota-black mb-2">
                End Time (Auto-calculated)
              </label>
              <input
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            {/* Workflow Actions */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-toyota-black mb-3">
                Workflow Actions
              </h4>
              <div className="flex flex-wrap gap-2">
                {bookingUtils.getNextActions(booking.status).map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => {
                      // Handle workflow action
                      console.log(
                        `Executing: ${action} for booking ${booking.id}`
                      );
                      onClose();
                    }}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      action === "Complete Job"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : action === "Pause Job"
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : action === "Resume Job"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        : "bg-toyota-red text-white hover:bg-toyota-red-dark"
                    }`}
                  >
                    {action}
                  </button>
                ))}
                {bookingUtils.getNextActions(booking.status).length === 0 && (
                  <span className="text-sm text-gray-500">
                    No actions available
                  </span>
                )}
              </div>

              {/* View History Button */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    onViewHistory(booking);
                    onClose();
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-toyota-red border border-toyota-red rounded-lg hover:bg-toyota-red hover:text-white transition-colors"
                >
                  📋 View Process History
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-toyota-text-secondary hover:text-toyota-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-toyota-primary px-4 py-2 text-sm"
              >
                Update Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Download Report Modal Component
interface DownloadReportModalProps {
  onClose: () => void;
  bookings: Booking[];
}

const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
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
            b.vehicleNo.toLowerCase().includes(carRegNo.toLowerCase())
          )
        : bookings;

      // Create CSV content
      const csvContent = [
        [
          "Vehicle No",
          "SVA",
          "Check-in Date",
          "Promised Date",
          "Current Process",
          "Status",
          "Start Time",
          "End Time",
          "Bay ID",
          "Priority",
          "Flow",
        ],
        ...filteredBookings.map((booking) => [
          booking.vehicleNo,
          booking.sva,
          booking.checkInDate,
          booking.promisedDate,
          booking.currentProcess,
          bookingUtils.getStatusText(booking.status),
          booking.startTime,
          booking.endTime,
          booking.bayId,
          booking.priority,
          booking.flow || "",
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
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-toyota-black">
            Download Report
          </h3>
          <button
            onClick={onClose}
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
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-toyota-black mb-2">
              Car Registration Number (Optional)
            </label>
            <input
              type="text"
              value={carRegNo}
              onChange={(e) => setCarRegNo(e.target.value)}
              placeholder="Leave empty to download all bookings"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toyota-red focus:border-toyota-red"
            />
            <p className="text-xs text-gray-500 mt-1">
              {carRegNo.trim()
                ? `Will download bookings for vehicles containing "${carRegNo}"`
                : "Will download all booking information and processes"}
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-toyota-text-secondary hover:text-toyota-black transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-toyota-primary px-4 py-2 text-sm flex items-center space-x-2"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
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
                  <span>Download CSV</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Process History Modal Component
interface ProcessHistoryModalProps {
  booking: Booking;
  onClose: () => void;
}

const ProcessHistoryModal: React.FC<ProcessHistoryModalProps> = ({
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
        }
      } catch (error) {
        console.error("Failed to fetch process history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcessHistory();
  }, [booking.id]);

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl  w-full max-h-96 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-toyota-black">
              Process History
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Vehicle: {booking.vehicleNo} | SVA: {booking.sva}
            </p>
          </div>
          <button
            onClick={onClose}
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
        <div className="p-6 overflow-y-auto max-h-80">
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
                    <div>Start: {step.startTime}</div>
                    {step.endTime && <div>End: {step.endTime}</div>}
                    {step.bayId && <div>Bay: {step.bayId}</div>}
                    {step.notes && <div>Notes: {step.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-toyota-primary px-4 py-2 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isProcessHistoryModalOpen, setIsProcessHistoryModalOpen] =
    useState(false);
  const [selectedBookingForHistory, setSelectedBookingForHistory] =
    useState<Booking | null>(null);

  // Generate time slots from 8:00 AM to 5:00 PM (30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break; // Stop at 5:00 PM
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Mock data for bays
  const bays: Bay[] = [
    {
      id: "bay-1",
      name: "Bay 1",
      process: "Surface Preparation",
      status: "active",
    },
    { id: "bay-2", name: "Bay 2", process: "Spray Booth", status: "active" },
    {
      id: "bay-3",
      name: "Bay 3",
      process: "Quality Control",
      status: "active",
    },
    {
      id: "bay-4",
      name: "Bay 4",
      process: "Surface Preparation",
      status: "active",
    },
    { id: "bay-5", name: "Bay 5", process: "Spray Booth", status: "active" },
    {
      id: "bay-6",
      name: "Bay 6",
      process: "Quality Control",
      status: "active",
    },
    {
      id: "bay-7",
      name: "Bay 7",
      process: "Surface Preparation",
      status: "active",
    },
    { id: "bay-8", name: "Bay 8", process: "Spray Booth", status: "active" },
    {
      id: "bay-9",
      name: "Bay 9",
      process: "Quality Control",
      status: "active",
    },
    {
      id: "bay-10",
      name: "Bay 10",
      process: "Surface Preparation",
      status: "active",
    },
    { id: "bay-11", name: "Bay 11", process: "Spray Booth", status: "active" },
    {
      id: "bay-12",
      name: "Bay 12",
      process: "Quality Control",
      status: "active",
    },
  ];

  // Mock bookings data
  useEffect(() => {
    const mockBookings: Booking[] = [
      // Queuing bookings
      {
        id: "booking-1",
        vehicleNo: "BGC543",
        sva: "Abu",
        checkInDate: "05-Sep",
        promisedDate: "26-Sep",
        currentProcess: "Surface Preparation",
        status: "queuing",
        startTime: "08:00",
        endTime: "10:30",
        bayId: "bay-4",
        priority: "high",
      },
      // Bay Queue bookings
      {
        id: "booking-2",
        vehicleNo: "fgh4536",
        sva: "Abu",
        checkInDate: "04-Sep",
        promisedDate: "18-Sep",
        currentProcess: "Panel Beating",
        status: "bay_queue",
        startTime: "10:30",
        endTime: "11:30",
        bayId: "bay-1",
        priority: "medium",
      },
      {
        id: "booking-3",
        vehicleNo: "hjdoik",
        sva: "Abu",
        checkInDate: "10-Sep",
        promisedDate: "17-Sep",
        currentProcess: "Panel Beating",
        status: "bay_queue",
        startTime: "09:00",
        endTime: "12:00",
        bayId: "bay-1",
        priority: "high",
      },
      {
        id: "booking-4",
        vehicleNo: "CVB543",
        sva: "ABU",
        checkInDate: "06-Sep",
        promisedDate: "15-Sep",
        flow: "A/D | PB | PL",
        currentProcess: "Polishing",
        status: "bay_queue",
        startTime: "11:00",
        endTime: "13:00",
        bayId: "bay-6",
        priority: "low",
      },
      {
        id: "booking-5",
        vehicleNo: "VJT543",
        sva: "Abu",
        checkInDate: "18-Sep",
        promisedDate: "25-Sep",
        currentProcess: "Surface Preparation",
        status: "bay_queue",
        startTime: "13:00",
        endTime: "16:00",
        bayId: "bay-4",
        priority: "high",
      },
      // Next Job
      {
        id: "booking-6",
        vehicleNo: "VJT6591",
        sva: "Abu",
        checkInDate: "05-Sep",
        promisedDate: "19-Sep",
        currentProcess: "Surface Preparation",
        status: "next_job",
        startTime: "14:00",
        endTime: "16:30",
        bayId: "bay-4",
        priority: "medium",
      },
      // Active bookings in timeline
      {
        id: "booking-7",
        vehicleNo: "PKJ1234",
        sva: "Test",
        checkInDate: "10-Sep",
        promisedDate: "10-Sep",
        flow: "SP | SB",
        currentProcess: "Spray Booth",
        status: "active",
        startTime: "12:00",
        endTime: "13:30",
        bayId: "bay-5",
        priority: "high",
      },
      {
        id: "booking-8",
        vehicleNo: "fgh789",
        sva: "Ali",
        checkInDate: "03-Sep",
        promisedDate: "10-Sep",
        flow: "SB | A/D",
        currentProcess: "Assembly/Disassembly",
        status: "active",
        startTime: "08:00",
        endTime: "10:45",
        bayId: "bay-7",
        priority: "high",
      },
      {
        id: "booking-9",
        vehicleNo: "FVC432",
        sva: "Abu",
        checkInDate: "05-Sep",
        promisedDate: "19-Sep",
        flow: "PL | A/D | WS",
        currentProcess: "Windscreen",
        status: "active",
        startTime: "11:45",
        endTime: "14:15",
        bayId: "bay-8",
        priority: "high",
      },
      // Completed bookings
      {
        id: "booking-10",
        vehicleNo: "vjt3456",
        sva: "Abu",
        checkInDate: "05-Sep",
        promisedDate: "12-Sep",
        currentProcess: "Surface Preparation",
        status: "completed",
        startTime: "08:00",
        endTime: "10:00",
        bayId: "bay-4",
        priority: "medium",
      },
      {
        id: "booking-11",
        vehicleNo: "hisn",
        sva: "Abu",
        checkInDate: "11-Sep",
        promisedDate: "18-Sep",
        currentProcess: "Spray Booth",
        status: "completed",
        startTime: "10:00",
        endTime: "12:00",
        bayId: "bay-5",
        priority: "medium",
      },
      {
        id: "booking-12",
        vehicleNo: "fgh5678",
        sva: "Ali",
        checkInDate: "03-Sep",
        promisedDate: "17-Sep",
        flow: "A/D | PL",
        currentProcess: "Polishing",
        status: "completed",
        startTime: "14:00",
        endTime: "16:00",
        bayId: "bay-6",
        priority: "medium",
      },
      {
        id: "booking-13",
        vehicleNo: "vjt6591",
        sva: "Abu",
        checkInDate: "05-Sep",
        promisedDate: "19-Sep",
        currentProcess: "Assembly/Disassembly",
        status: "completed",
        startTime: "16:00",
        endTime: "18:00",
        bayId: "bay-7",
        priority: "high",
      },
    ];
    setBookings(mockBookings);
  }, []);

  // Workflow functions with process tracking
  const handleStatusTransition = async (booking: Booking, action: string) => {
    try {
      let response;
      let processStepData = null;

      switch (action) {
        case "Assign to Bay":
          response = await bookingAPI.workflow.assignToBay(
            booking.id,
            booking.bayId
          );
          // Track process step
          processStepData = {
            processName: booking.currentProcess,
            status: "started" as const,
            startTime: new Date().toISOString(),
            bayId: booking.bayId,
            notes: "Assigned to bay",
          };
          break;
        case "Move to Next Job":
          response = await bookingAPI.workflow.moveToNextJob(
            booking.id,
            booking.currentProcess
          );
          // Track process step
          processStepData = {
            processName: booking.currentProcess,
            status: "started" as const,
            startTime: new Date().toISOString(),
            notes: "Moved to next job queue",
          };
          break;
        case "Start Job":
          response = await bookingAPI.workflow.startJob(
            booking.id,
            booking.startTime,
            booking.endTime
          );
          // Track process step
          processStepData = {
            processName: booking.currentProcess,
            status: "started" as const,
            startTime: booking.startTime,
            endTime: booking.endTime,
            bayId: booking.bayId,
            notes: "Job started",
          };
          break;
        case "Pause Job":
          response = await bookingAPI.workflow.pauseJob(booking.id);
          // Track process step
          processStepData = {
            processName: booking.currentProcess,
            status: "paused" as const,
            startTime: booking.startTime,
            endTime: new Date().toISOString(),
            bayId: booking.bayId,
            notes: "Job paused",
          };
          break;
        case "Resume Job":
          response = await bookingAPI.workflow.resumeJob(booking.id);
          // Track process step
          processStepData = {
            processName: booking.currentProcess,
            status: "started" as const,
            startTime: new Date().toISOString(),
            bayId: booking.bayId,
            notes: "Job resumed",
          };
          break;
        case "Complete Job":
          response = await bookingAPI.workflow.completeJob(booking.id);
          // Track process step
          processStepData = {
            processName: booking.currentProcess,
            status: "completed" as const,
            startTime: booking.startTime,
            endTime: new Date().toISOString(),
            bayId: booking.bayId,
            notes: "Job completed",
          };
          break;
        default:
          return;
      }

      if (response.success && response.data) {
        setBookings((prevBookings) =>
          prevBookings.map((b) => (b.id === booking.id ? response.data! : b))
        );

        // Add process step to history
        if (processStepData) {
          try {
            await bookingAPI.processTracking.addProcessStep(
              booking.id,
              processStepData
            );
          } catch (error) {
            console.error("Failed to add process step:", error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to update booking status:", error);
    }
  };

  const getBookingPosition = (booking: Booking) => {
    const startIndex = timeSlots.indexOf(booking.startTime);
    const endIndex = timeSlots.indexOf(booking.endTime);
    const duration = endIndex - startIndex;

    const left = startIndex * 80; // 80px per time slot (w-20 = 80px)
    const width = duration * 80;

    return { left, width };
  };

  const getBookingsForBay = (bayId: string) => {
    return bookings.filter((booking) => booking.bayId === bayId);
  };

  // Process options for dropdown
  const processOptions = [
    "Surface Preparation",
    "Spray Booth",
    "Quality Control",
    "Final Inspection",
    "Delivery Preparation",
  ];

  // Modal functions
  const openModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  const updateBooking = (updatedBooking: Booking) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      )
    );
    closeModal();
  };

  const handleViewHistory = (booking: Booking) => {
    setSelectedBookingForHistory(booking);
    setIsProcessHistoryModalOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-toyota-black">
              Booking Management Dashboard
            </h1>
            <p className="text-toyota-text-secondary mt-1">
              Real-time view of bay operations and job scheduling
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-toyota-text-secondary">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="btn-toyota-outline px-4 py-2 text-sm flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
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
              <span>Download Report</span>
            </button>
            <button className="btn-toyota-primary px-4 py-2 text-sm">
              Add Booking
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-toyota-text-secondary font-medium">
                Total Bookings
              </div>
              <div className="text-3xl font-bold text-toyota-black mt-1">
                {bookings.length}
              </div>
            </div>
            <div className="w-12 h-12 bg-toyota-gray rounded-lg flex items-center justify-center">
              <span className="text-toyota-black text-xl">📋</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-toyota-text-secondary font-medium">
                Active
              </div>
              <div className="text-3xl font-bold text-green-600 mt-1">
                {bookings.filter((b) => b.status === "active").length}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">⚡</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-toyota-text-secondary font-medium">
                Queuing
              </div>
              <div className="text-3xl font-bold text-yellow-600 mt-1">
                {bookings.filter((b) => b.status === "queuing").length}
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⏰</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-toyota-text-secondary font-medium">
                Stoppages
              </div>
              <div className="text-3xl font-bold text-red-600 mt-1">
                {bookings.filter((b) => b.status === "stoppage").length}
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 p-4 bg-toyota-gray rounded-lg">
        <h3 className="text-sm font-semibold text-toyota-black mb-2">
          Status Legend:
        </h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Queuing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Bay Queue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span>Next Job</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span>Stoppage</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* First Table - Queuing Columns */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-lg mb-4">
        {/* Header Row */}
        <div className="grid grid-cols-7 bg-toyota-gray border-b-2 border-gray-300 shadow-sm">
          <div className="col-span-1 p-3 border-r-2 border-gray-300 bg-toyota-gray">
            <div className="text-xs font-bold text-toyota-black text-center">
              Queuing
            </div>
          </div>
          <div className="col-span-1 p-3 border-r-2 border-gray-300 bg-toyota-gray">
            <div className="text-xs font-bold text-toyota-black text-center">
              Bay Queue
            </div>
          </div>
          <div className="col-span-1 p-3 border-r-2 border-gray-300 bg-toyota-gray">
            <div className="text-xs font-bold text-toyota-black text-center">
              Next Job
            </div>
          </div>
          <div className="col-span-1 p-3 border-r-2 border-gray-300 bg-toyota-gray">
            <div className="text-xs font-bold text-toyota-black text-center">
              Bay No
            </div>
          </div>
          <div className="col-span-1 p-3 border-r-2 border-gray-300 bg-toyota-gray">
            <div className="text-xs font-bold text-toyota-black text-center">
              Status
            </div>
          </div>
          <div className="col-span-1 p-3 border-r-2 border-gray-300 bg-toyota-gray">
            <div className="text-xs font-bold text-toyota-black text-center">
              Job Stoppage
            </div>
          </div>
          <div className="col-span-1 p-3 border-r-2 border-gray-300 bg-toyota-gray">
            <div className="text-xs font-bold text-toyota-black text-center">
              Repair Completion
            </div>
          </div>
        </div>

        {/* Content Row */}
        <div className="grid grid-cols-7 min-h-32">
          {/* Queuing Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-yellow-50">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "queuing")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.status
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.vehicleNo}
                    </div>
                    <div className="text-xs truncate">SVA: {booking.sva}</div>
                    <div className="text-xs truncate">
                      {booking.checkInDate} → {booking.promisedDate}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {booking.currentProcess}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Bay Queue Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-blue-50">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "bay_queue")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.status
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.vehicleNo}
                    </div>
                    <div className="text-xs truncate">SVA: {booking.sva}</div>
                    <div className="text-xs truncate">
                      {booking.checkInDate} → {booking.promisedDate}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {booking.currentProcess}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Next Job Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-purple-50">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "next_job")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.status
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.vehicleNo}
                    </div>
                    <div className="text-xs truncate">SVA: {booking.sva}</div>
                    <div className="text-xs truncate">
                      {booking.checkInDate} → {booking.promisedDate}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {booking.currentProcess}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Bay No Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-gray-50">
            <div className="space-y-2">
              {bays.map((bay) => (
                <div
                  key={bay.id}
                  className="p-2 bg-white rounded border h-16 flex flex-col justify-center"
                >
                  <div className="text-xs font-bold">{bay.name}</div>
                  <div className="text-xs text-gray-600">{bay.process}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-gray-50">
            <div className="space-y-2">
              {bays.map((bay) => (
                <div
                  key={bay.id}
                  className="flex justify-center items-center h-16"
                >
                  <div
                    className={`w-4 h-4 rounded-full ${
                      bay.status === "active"
                        ? "bg-green-500"
                        : bay.status === "inactive"
                        ? "bg-gray-400"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Stoppage Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-red-50">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "stoppage")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.status
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.vehicleNo}
                    </div>
                    <div className="text-xs truncate">SVA: {booking.sva}</div>
                    <div className="text-xs truncate">
                      {booking.checkInDate} → {booking.promisedDate}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {booking.currentProcess}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Repair Completion Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-green-50">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "completed")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.status
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.vehicleNo}
                    </div>
                    <div className="text-xs truncate">SVA: {booking.sva}</div>
                    <div className="text-xs truncate">
                      {booking.checkInDate} → {booking.promisedDate}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {booking.currentProcess}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Table - Bay Timeline */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-lg">
        {/* Sticky Header Row */}
        <div className="sticky top-0 z-30 flex bg-toyota-gray border-b-2 border-gray-300 shadow-lg">
          <div className="w-32 p-3 border-r-2 border-gray-300 bg-toyota-gray flex-shrink-0">
            <div className="text-xs font-bold text-toyota-black text-center h-40 flex items-center justify-center">
              Bay No
            </div>
          </div>
          <div className="w-16 p-3 border-r-2 border-gray-300 bg-toyota-gray flex-shrink-0">
            <div className="text-xs font-bold text-toyota-black text-center h-40 flex items-center justify-center">
              Status
            </div>
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex h-40 min-w-max">
              {timeSlots.map((time, index) => (
                <div
                  key={time}
                  className="flex-shrink-0 w-20 border-r border-gray-300 p-1 text-center bg-toyota-gray flex items-center justify-center"
                >
                  <div className="text-xs font-bold text-toyota-black">
                    {time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bay Rows */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {bays.map((bay, bayIndex) => {
            const bayBookings = getBookingsForBay(bay.id);

            return (
              <div
                key={bay.id}
                className={`flex border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  bayIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* Bay Information Column - Fixed Width */}
                <div className="w-32 p-3 border-r-2 border-gray-300 bg-inherit flex-shrink-0">
                  <div className="h-40 flex flex-col justify-center">
                    <div className="text-sm font-bold text-toyota-black">
                      {bay.name}
                    </div>
                    <div className="text-xs text-toyota-text-secondary font-medium">
                      {bay.process}
                    </div>
                  </div>
                </div>

                {/* Status Column - Fixed Width */}
                <div className="w-16 p-3 border-r-2 border-gray-300 bg-inherit flex-shrink-0">
                  <div className="h-40 flex items-center justify-center">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        bay.status === "active"
                          ? "bg-green-500"
                          : bay.status === "inactive"
                          ? "bg-gray-400"
                          : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Timeline Column - Flexible Width */}
                <div className="flex-1 relative overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="flex h-40 relative min-w-max">
                    {/* Time slot grid lines */}
                    {timeSlots.map((time, index) => (
                      <div
                        key={time}
                        className="flex-shrink-0 w-20 border-r border-gray-200 relative"
                      >
                        {/* Hour markers */}
                        {index % 2 === 0 && (
                          <div className="absolute top-0 left-0 w-full h-full border-r-2 border-gray-300"></div>
                        )}
                        {/* Half-hour markers */}
                        {index % 2 === 1 && (
                          <div className="absolute top-0 left-0 w-full h-full border-r border-gray-200"></div>
                        )}
                      </div>
                    ))}

                    {/* Booking cards */}
                    {bayBookings
                      .filter(
                        (b) => b.status === "active" || b.status === "stoppage"
                      )
                      .map((booking) => {
                        const position = getBookingPosition(booking);
                        return (
                          <div
                            key={booking.id}
                            className={`absolute top-4 bottom-4 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                              booking.status
                            )} cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                            style={{
                              left: position.left,
                              width: position.width,
                              zIndex: 10,
                            }}
                            title={`Vehicle: ${booking.vehicleNo} | SVA: ${
                              booking.sva
                            } | Check-in: ${booking.checkInDate} | Promised: ${
                              booking.promisedDate
                            } | Process: ${
                              booking.currentProcess
                            } | Status: ${bookingUtils.getStatusText(
                              booking.status
                            )}`}
                            onClick={() => openModal(booking)}
                          >
                            <div className="p-4 h-full flex flex-col justify-between">
                              <div className="text-sm font-bold text-gray-900">
                                {booking.vehicleNo}
                              </div>
                              <div className="text-xs text-gray-700">
                                SVA: {booking.sva}
                              </div>
                              <div className="text-xs text-gray-600">
                                {booking.checkInDate} → {booking.promisedDate}
                              </div>
                              {booking.flow && (
                                <div className="text-xs font-medium text-gray-700">
                                  {booking.flow}
                                </div>
                              )}
                              <div className="text-xs font-medium text-gray-800">
                                {booking.currentProcess}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Edit Modal */}
      {isModalOpen && selectedBooking && (
        <BookingEditModal
          booking={selectedBooking}
          onClose={closeModal}
          onUpdate={updateBooking}
          onViewHistory={handleViewHistory}
          processOptions={processOptions}
          timeSlots={timeSlots}
          bays={bays}
        />
      )}

      {/* Download Report Modal */}
      {isDownloadModalOpen && (
        <DownloadReportModal
          onClose={() => setIsDownloadModalOpen(false)}
          bookings={bookings}
        />
      )}

      {/* Process History Modal */}
      {isProcessHistoryModalOpen && selectedBookingForHistory && (
        <ProcessHistoryModal
          booking={selectedBookingForHistory}
          onClose={() => {
            setIsProcessHistoryModalOpen(false);
            setSelectedBookingForHistory(null);
          }}
        />
      )}
    </div>
  );
};

export default BookingDashboard;
