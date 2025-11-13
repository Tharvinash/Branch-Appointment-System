"use client";

import React, { useState, useEffect } from "react";
import { bookingAPI, bookingUtils, Booking } from "@/lib/api/bookings";
import BookingEditModal from "./modals/BookingEditModal";
import DownloadReportModal from "./modals/DownloadReportModal";
import ProcessHistoryModal from "./modals/ProcessHistoryModal";
import AddBookingModal from "./modals/AddBookingModal";
import StoppageReasonModal from "./modals/StoppageReasonModal";
import { Bay, bayAPI, bayUtils } from "@/lib/api/bays";
import { ServiceAdvisor, serviceAdvisorAPI } from "@/lib/api/service-advisors";
import { getBayColor, getBayColorClass } from "@/lib/utils/bayColors";
import { ProcessStep } from "@/lib/api/bookings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const BookingDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bays, setBays] = useState<Bay[]>([]);
  const [serviceAdvisors, setServiceAdvisors] = useState<ServiceAdvisor[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isProcessHistoryModalOpen, setIsProcessHistoryModalOpen] =
    useState(false);
  const [selectedBookingForHistory, setSelectedBookingForHistory] =
    useState<Booking | null>(null);
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
  const [isStoppageModalOpen, setIsStoppageModalOpen] = useState(false);
  const [selectedBookingForStoppage, setSelectedBookingForStoppage] = useState<
    number | null
  >(null);
  const [bookingProcessHistory, setBookingProcessHistory] = useState<
    Record<number, ProcessStep[]>
  >({});
  const [showEndOfDayModal, setShowEndOfDayModal] = useState(false);
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);

  // Generate time slots from 8:00 AM to 7:00 PM (30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 19 && minute > 0) break; // Stop at 7:00 PM
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        console.error("Failed to fetch bookings:", response.message);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchBays = async () => {
    try {
      const response = await bayAPI.getAllBays();
      if (response.success && response.data) {
        setBays(response.data);
      } else {
        console.error("Failed fetching bays:", response.message);
      }
    } catch (error) {
      console.error("Error fetching bays:", error);
    }
  };

  const fetchServiceAdvisors = async () => {
    try {
      const response = await serviceAdvisorAPI.getAllServiceAdvisors();
      if (response.success && response.data) {
        setServiceAdvisors(response.data);
      } else {
        console.error("Failed to fetch service advisors:", response.message);
      }
    } catch (error) {
      console.error("Error fetching service advisors:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchBays();
    fetchServiceAdvisors();
  }, []);

  // Fetch bookings data from API
  useEffect(() => {
    fetchBookings();
  }, []);

  // End-of-day check: Detect jobs still in production at 7:00 PM
  useEffect(() => {
    const checkEndOfDay = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const today = now.toISOString().split("T")[0];

      // Check if it's exactly 7:00 PM (19:00) - only run once per day
      if (currentHour === 19 && currentMinute === 0) {
        // Check if we've already stored jobs for today
        const alreadyStored = localStorage.getItem(
          `pendingJobs_stored_${today}`
        );
        if (alreadyStored === "true") {
          return; // Already stored for today, skip
        }

        const activeBookings = bookings.filter(
          (b) =>
            b.status === "ACTIVE_BOARD" &&
            b.jobEndTime &&
            (() => {
              const endTime = b.jobEndTime.split(":");
              const endHour = parseInt(endTime[0]);
              const endMinute = parseInt(endTime[1] || "0");
              // Check if job end time is at or after 7:00 PM
              return endHour >= 19;
            })()
        );

        if (activeBookings.length > 0) {
          // Store in localStorage to show prompt next day
          const pendingJobs = activeBookings.map((b) => ({
            id: b.id,
            carRegNo: b.carRegNo,
            bayId: b.bayId,
            jobEndTime: b.jobEndTime,
            status: b.status,
          }));
          localStorage.setItem(
            `pendingJobs_${today}`,
            JSON.stringify(pendingJobs)
          );
          // Mark as stored for today
          localStorage.setItem(`pendingJobs_stored_${today}`, "true");
        }
      }

      // Reset the stored flag at midnight (00:00)
      if (currentHour === 0 && currentMinute === 0) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        localStorage.removeItem(`pendingJobs_stored_${yesterdayStr}`);
      }
    };

    // Check every minute
    const interval = setInterval(checkEndOfDay, 60000);
    checkEndOfDay(); // Initial check

    return () => clearInterval(interval);
  }, [bookings]);

  // Fetch process history for all bookings to show flow (debounced to avoid excessive API calls)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchProcessHistory = async () => {
      // Only fetch history for bookings that are ACTIVE_BOARD (to show flow indicators)
      const activeBookings = bookings.filter(
        (b) => b.status === "ACTIVE_BOARD"
      );

      if (activeBookings.length === 0) {
        setBookingProcessHistory({});
        return;
      }

      const historyMap: Record<number, ProcessStep[]> = {};

      // Fetch in parallel for better performance
      const promises = activeBookings.map(async (booking) => {
        try {
          const response = await bookingAPI.getBookingHistory(booking.id);
          if (response.success && response.data) {
            historyMap[booking.id] = response.data;
          }
        } catch (error) {
          console.error(
            `Error fetching history for booking ${booking.id}:`,
            error
          );
        }
      });

      await Promise.all(promises);
      setBookingProcessHistory(historyMap);
    };

    // Debounce: wait 500ms after bookings change before fetching
    timeoutId = setTimeout(() => {
      if (bookings.length > 0) {
        fetchProcessHistory();
      }
    }, 500);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [bookings]);

  // Check for pending jobs from previous day on component mount
  useEffect(() => {
    const checkPendingJobs = () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const stored = localStorage.getItem(`pendingJobs_${yesterdayStr}`);
      if (stored) {
        try {
          const jobs = JSON.parse(stored);
          if (jobs.length > 0) {
            setPendingJobs(jobs);
            setShowEndOfDayModal(true);
            // Clear the stored data after showing
            localStorage.removeItem(`pendingJobs_${yesterdayStr}`);
          }
        } catch (error) {
          console.error("Error parsing pending jobs:", error);
        }
      }
    };

    checkPendingJobs();
  }, []);

  const getBookingPosition = (booking: Booking) => {
    const startTime = booking.jobStartTime?.slice(0, 5) || "08:00";
    const endTime = booking.jobEndTime?.slice(0, 5) || "10:00";
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    const duration = endIndex - startIndex;

    const left = startIndex * 80; // 80px per time slot (w-20 = 80px)
    const width = duration * 80;

    return { left, width };
  };

  const getBookingsForBay = (bayId: number) => {
    return bookings.filter((booking) => booking.bayId === bayId);
  };

  // Helper function to get service advisor name by ID
  const getServiceAdvisorName = (serviceAdvisorId: number): string => {
    const advisor = serviceAdvisors.find(
      (advisor) => advisor.id === serviceAdvisorId
    );
    return advisor ? advisor.name : `SVA: ${serviceAdvisorId}`;
  };

  // Helper function to get bay name by ID
  const getBayName = (bayId: number): string => {
    const bay = bays.find((bay) => bay.id === bayId);
    return bay ? bay.name.name : `Bay ${bayId}`;
  };

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

  const handlePauseJob = (bookingId: number) => {
    setSelectedBookingForStoppage(bookingId);
    setIsStoppageModalOpen(true);
  };

  const handleStoppageConfirm = async (reasonId: number) => {
    if (!selectedBookingForStoppage) return;

    try {
      // First get the stoppage reasons to find the reason name
      const reasonsResponse = await bookingAPI.getStoppageReasons();
      if (!reasonsResponse.success || !reasonsResponse.data) {
        console.error("Failed to fetch stoppage reasons");
        return;
      }

      // Find the reason name by ID
      const selectedReason = reasonsResponse.data.find(
        (reason) => reason.id === reasonId
      );
      if (!selectedReason) {
        console.error("Selected reason not found");
        return;
      }

      // Pause the job with the reason name
      const response = await bookingAPI.workflow.pauseJob(
        selectedBookingForStoppage,
        selectedReason.reasonName
      );

      if (response.success) {
        setIsStoppageModalOpen(false);
        setSelectedBookingForStoppage(null);
        fetchBookings(); // Refresh the bookings list
      } else {
        console.error("Failed to pause job:", response.message);
      }
    } catch (error) {
      console.error("Error pausing job:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-toyota-black">
              Job Progress Control Board
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
              className="btn-toyota-outline px-4 py-2 text-sm flex items-center space-x-2 h-10"
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
            <button
              onClick={() => setIsAddBookingModalOpen(true)}
              className="btn-toyota-primary px-4 py-2 text-sm h-10"
            >
              Add Booking
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-toyota-text-secondary font-medium">
                Bays Open
              </div>
              <div className="text-2xl font-bold text-black mt-1">
                {bays.filter((b) => b.status === "ACTIVE").length}
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">🏭</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-toyota-text-secondary font-medium">
                Queuing
              </div>
              <div className="text-2xl font-bold text-black mt-1">
                {bookings.filter((b) => b.status === "QUEUING").length}
              </div>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-lg">⏰</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-toyota-text-secondary font-medium">
                Next Job
              </div>
              <div className="text-2xl font-bold text-black mt-1">
                {bookings.filter((b) => b.status === "NEXT_JOB").length}
              </div>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">📋</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-toyota-text-secondary font-medium">
                In Progress
              </div>
              <div className="text-2xl font-bold text-black mt-1">
                {bookings.filter((b) => b.status === "ACTIVE_BOARD").length}
              </div>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg">⚡</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-toyota-text-secondary font-medium">
                Waiting For QC
              </div>
              <div className="text-2xl font-bold text-black mt-1">
                {bookings.filter((b) => b.status === "BAY_QUEUE").length}
              </div>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 text-lg">🔍</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-toyota-text-secondary font-medium">
                Repair Completion
              </div>
              <div className="text-2xl font-bold text-black mt-1">
                {
                  bookings.filter((b) => b.status === "REPAIR_COMPLETION")
                    .length
                }
              </div>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 text-lg">✅</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-toyota-text-secondary font-medium">
                Job Stoppage
              </div>
              <div className="text-2xl font-bold text-black mt-1">
                {bookings.filter((b) => b.status === "JOB_STOPPAGE").length}
              </div>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-lg">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Queuing, Waiting For QC, Repair Completion Table */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-lg mb-4">
        {/* Header Row */}
        <div className="grid grid-cols-3 bg-toyota-gray border-b-2 border-gray-300 shadow-sm">
          <div className="col-span-1 p-3 border-r-2 border-gray-300 bg-toyota-gray">
            <div className="text-xs font-bold text-toyota-black text-center">
              Queuing
            </div>
          </div>
          <div className="col-span-1 p-3 border-r-2 border-gray-300 bg-toyota-gray">
            <div className="text-xs font-bold text-toyota-black text-center">
              Waiting For QC
            </div>
          </div>
          <div className="col-span-1 p-3 border-r-2 border-gray-300 bg-toyota-gray">
            <div className="text-xs font-bold text-toyota-black text-center">
              Repair Completion
            </div>
          </div>
        </div>
        {/* Content Row */}
        <div className="grid grid-cols-3 min-h-64">
          {/* Queuing Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-[#fef2f2] overflow-y-auto max-h-64">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "QUEUING")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.jobType
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.carRegNo}
                    </div>
                    <div className="text-xs truncate">
                      SVA: {getServiceAdvisorName(booking.serviceAdvisorId)}
                    </div>
                    <div className="text-xs truncate">
                      {new Date(booking.checkinDate).toLocaleDateString()} →{" "}
                      {new Date(booking.promiseDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {bookingUtils.getJobTypeText(booking.jobType)}
                    </div>
                  </div>
                ))}
              {bookings.filter((b) => b.status === "QUEUING").length === 0 && (
                <div className="text-xs text-gray-400 text-center py-8">
                  No bookings in queue
                </div>
              )}
            </div>
          </div>

          {/* Waiting For QC Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-[#fef2f2] overflow-y-auto max-h-64">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "BAY_QUEUE")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.jobType
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.carRegNo}
                    </div>
                    <div className="text-xs truncate">
                      SVA: {getServiceAdvisorName(booking.serviceAdvisorId)}
                    </div>
                    <div className="text-xs truncate">
                      {new Date(booking.checkinDate).toLocaleDateString()} →{" "}
                      {new Date(booking.promiseDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {bookingUtils.getJobTypeText(booking.jobType)}
                    </div>
                  </div>
                ))}
              {bookings.filter((b) => b.status === "BAY_QUEUE").length ===
                0 && (
                <div className="text-xs text-gray-400 text-center py-8">
                  No jobs waiting for QC
                </div>
              )}
            </div>
          </div>

          {/* Repair Completion Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-[#fef2f2] overflow-y-auto max-h-64">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "REPAIR_COMPLETION")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.jobType
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.carRegNo}
                    </div>
                    <div className="text-xs truncate">
                      SVA: {getServiceAdvisorName(booking.serviceAdvisorId)}
                    </div>
                    <div className="text-xs truncate">
                      {new Date(booking.checkinDate).toLocaleDateString()} →{" "}
                      {new Date(booking.promiseDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {bookingUtils.getJobTypeText(booking.jobType)}
                    </div>
                  </div>
                ))}
              {bookings.filter((b) => b.status === "REPAIR_COMPLETION")
                .length === 0 && (
                <div className="text-xs text-gray-400 text-center py-8">
                  No completed repairs
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bay Timeline Table */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-lg">
        {/* Sticky Header Row */}
        <div className="sticky top-0 z-30 flex bg-toyota-gray border-b-2 border-gray-300 shadow-lg">
          {/* Next Job Column Header */}
          <div className="w-32 p-3 border-r-2 border-gray-300 bg-toyota-gray flex-shrink-0">
            <div className="text-xs font-bold text-toyota-black text-center h-40 flex items-center justify-center">
              Next Job
            </div>
          </div>
          {/* Bay No Column Header */}
          <div className="w-32 p-3 border-r-2 border-gray-300 bg-toyota-gray flex-shrink-0">
            <div className="text-xs font-bold text-toyota-black text-center h-40 flex items-center justify-center">
              Bay No
            </div>
          </div>
          {/* Status Column Header */}
          <div className="w-16 p-3 border-r-2 border-gray-300 bg-toyota-gray flex-shrink-0">
            <div className="text-xs font-bold text-toyota-black text-center h-40 flex items-center justify-center">
              Status
            </div>
          </div>
          {/* Time Slots */}
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
          {/* Job Stoppage Column Header */}
          <div className="w-32 p-3 border-r-2 border-gray-300 bg-toyota-gray flex-shrink-0">
            <div className="text-xs font-bold text-toyota-black text-center h-40 flex items-center justify-center">
              Job Stoppage
            </div>
          </div>
        </div>

        {/* Bay Rows */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {bays.map((bay, bayIndex) => {
            const bayBookings = getBookingsForBay(bay.id);
            // Only show NEXT_JOB bookings assigned to this specific bay
            const nextJobBookings = bookings.filter(
              (b) => b.status === "NEXT_JOB" && b.bayId === bay.id
            );
            // Only show JOB_STOPPAGE bookings assigned to this specific bay
            const stoppageBookings = bookings.filter(
              (b) => b.status === "JOB_STOPPAGE" && b.bayId === bay.id
            );

            return (
              <div
                key={bay.id}
                className={`flex border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  bayIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* Next Job Column */}
                <div className="w-32 p-2 border-r-2 border-gray-300 bg-[#fef2f2] flex-shrink-0 overflow-y-auto">
                  <div className="space-y-2">
                    {nextJobBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                          booking.jobType
                        )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                        onClick={() => openModal(booking)}
                      >
                        <div className="text-xs font-bold truncate">
                          {booking.carRegNo}
                        </div>
                        <div className="text-xs truncate">
                          SVA: {getServiceAdvisorName(booking.serviceAdvisorId)}
                        </div>
                        <div className="text-xs truncate">
                          {new Date(booking.checkinDate).toLocaleDateString()} →{" "}
                          {new Date(booking.promiseDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs font-medium truncate">
                          {bookingUtils.getJobTypeText(booking.jobType)}
                        </div>
                      </div>
                    ))}
                    {nextJobBookings.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-4"></div>
                    )}
                  </div>
                </div>

                {/* Bay Information Column - Fixed Width */}
                <div className="w-32 p-3 border-r-2 border-gray-300 bg-inherit flex-shrink-0">
                  <div className="h-40 flex flex-col justify-center">
                    <div className="text-sm font-bold text-toyota-black">
                      {bay.name.name}
                    </div>
                    <div className="text-xs text-toyota-text-secondary font-medium">
                      {bay.number}
                    </div>
                    <div className="text-xs text-gray-500">
                      {bay.technician?.name || "Not Assigned"}
                    </div>
                  </div>
                </div>

                {/* Status Column - Fixed Width */}
                <div className="w-16 p-3 border-r-2 border-gray-300 bg-inherit flex-shrink-0">
                  <div className="h-40 flex items-center justify-center">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        bay.status === "ACTIVE"
                          ? "bg-green-500"
                          : bay.status === "INACTIVE"
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
                      .filter((b) => b.status === "ACTIVE_BOARD")
                      .map((booking) => {
                        const position = getBookingPosition(booking);
                        return (
                          <div
                            key={booking.id}
                            className={`absolute top-4 bottom-4 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                              booking.jobType
                            )} cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                            style={{
                              left: position.left,
                              width: position.width,
                              zIndex: 10,
                            }}
                            title={`Vehicle: ${
                              booking.carRegNo
                            } | SVA: ${getServiceAdvisorName(
                              booking.serviceAdvisorId
                            )} | Check-in: ${new Date(
                              booking.checkinDate
                            ).toLocaleDateString()} | Promised: ${new Date(
                              booking.promiseDate
                            ).toLocaleDateString()} | Job Type: ${bookingUtils.getJobTypeText(
                              booking.jobType
                            )} | Status: ${bookingUtils.getStatusText(
                              booking.status
                            )}`}
                            onClick={() => openModal(booking)}
                          >
                            <div className="p-4 h-full flex flex-col justify-between relative">
                              <div className="text-sm font-bold text-gray-900">
                                {booking.carRegNo}
                              </div>
                              <div className="text-xs text-gray-700">
                                SVA:{" "}
                                {getServiceAdvisorName(
                                  booking.serviceAdvisorId
                                )}
                              </div>
                              <div className="text-xs text-gray-600">
                                {new Date(
                                  booking.checkinDate
                                ).toLocaleDateString()}{" "}
                                →{" "}
                                {new Date(
                                  booking.promiseDate
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs font-medium text-gray-800">
                                {bookingUtils.getJobTypeText(booking.jobType)}
                              </div>
                              {booking.status === "JOB_STOPPAGE" &&
                                booking.stoppageReason && (
                                  <div className="text-xs text-red-600 font-medium">
                                    Reason: {booking.stoppageReason}
                                  </div>
                                )}
                              {/* Flow indicator - bottom right */}
                              {booking.bayId &&
                                (() => {
                                  const currentBay = bays.find(
                                    (b) => b.id === booking.bayId
                                  );
                                  const history =
                                    bookingProcessHistory[booking.id] || [];
                                  const uniqueBays = new Set<string>();
                                  history.forEach((step: ProcessStep) => {
                                    if (step.toProcess?.name)
                                      uniqueBays.add(step.toProcess.name);
                                    if (step.fromProcess?.name)
                                      uniqueBays.add(step.fromProcess.name);
                                  });
                                  if (currentBay?.name?.name)
                                    uniqueBays.add(currentBay.name.name);

                                  return (
                                    <div className="absolute bottom-2 right-2 flex gap-1">
                                      {Array.from(uniqueBays)
                                        .slice(-3)
                                        .map((bayName, idx) => (
                                          <div
                                            key={idx}
                                            className="w-3 h-3 rounded-full border border-white shadow-sm"
                                            style={{
                                              backgroundColor:
                                                getBayColor(bayName),
                                            }}
                                            title={bayName}
                                          />
                                        ))}
                                    </div>
                                  );
                                })()}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Job Stoppage Column */}
                <div className="w-32 p-2 border-r-2 border-gray-300 bg-red-50 flex-shrink-0 overflow-y-auto">
                  <div className="space-y-2">
                    {stoppageBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                          booking.jobType
                        )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                        onClick={() => openModal(booking)}
                      >
                        <div className="text-xs font-bold truncate">
                          {booking.carRegNo}
                        </div>
                        <div className="text-xs truncate">
                          SVA: {getServiceAdvisorName(booking.serviceAdvisorId)}
                        </div>
                        <div className="text-xs truncate">
                          {new Date(booking.checkinDate).toLocaleDateString()} →{" "}
                          {new Date(booking.promiseDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs font-medium truncate">
                          {bookingUtils.getJobTypeText(booking.jobType)}
                        </div>
                        {booking.stoppageReason && (
                          <div className="text-xs text-red-600 font-medium truncate mt-1">
                            Reason: {booking.stoppageReason}
                          </div>
                        )}
                      </div>
                    ))}
                    {stoppageBookings.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-4"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Edit Modal */}
      <BookingEditModal
        open={isModalOpen && selectedBooking !== null}
        booking={selectedBooking!}
        onClose={closeModal}
        onSuccess={() => {
          closeModal();
          fetchBookings();
        }}
        onViewHistory={handleViewHistory}
        onPauseJob={handlePauseJob}
      />

      {/* Download Report Modal */}
      <DownloadReportModal
        open={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        bookings={bookings}
      />

      {/* Process History Modal */}
      <ProcessHistoryModal
        open={isProcessHistoryModalOpen && selectedBookingForHistory !== null}
        booking={selectedBookingForHistory!}
        onClose={() => {
          setIsProcessHistoryModalOpen(false);
          setSelectedBookingForHistory(null);
        }}
      />

      {/* Add Booking Modal */}
      <AddBookingModal
        open={isAddBookingModalOpen}
        onClose={() => setIsAddBookingModalOpen(false)}
        onSuccess={() => fetchBookings()}
      />

      {/* Stoppage Reason Modal */}
      <StoppageReasonModal
        open={isStoppageModalOpen}
        onClose={() => {
          setIsStoppageModalOpen(false);
          setSelectedBookingForStoppage(null);
        }}
        onConfirm={handleStoppageConfirm}
        bookingId={selectedBookingForStoppage || 0}
      />

      {/* End of Day Modal - Show pending jobs from previous day */}
      <Dialog open={showEndOfDayModal} onOpenChange={setShowEndOfDayModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Pending Jobs from Previous Day</DialogTitle>
            <DialogDescription>
              The following jobs were still in production at the end of
              yesterday. Please review and take appropriate action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingJobs.length > 0 ? (
              pendingJobs.map((job) => {
                const booking = bookings.find((b) => b.id === job.id);
                return (
                  <div
                    key={job.id}
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {job.carRegNo}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          End Time: {job.jobEndTime?.slice(0, 5) || "N/A"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Bay: {getBayName(job.bayId)}
                        </div>
                        {booking && (
                          <div className="text-sm text-gray-600 mt-1">
                            Current Status:{" "}
                            {bookingUtils.getStatusText(booking.status)}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (booking) {
                            openModal(booking);
                            setShowEndOfDayModal(false);
                          }
                        }}
                        className="ml-4"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                No pending jobs
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setShowEndOfDayModal(false);
                setPendingJobs([]);
              }}
              className="bg-toyota-red hover:bg-toyota-red-dark text-white"
            >
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingDashboard;
