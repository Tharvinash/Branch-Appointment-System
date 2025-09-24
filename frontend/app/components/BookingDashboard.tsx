"use client";

import React, { useState, useEffect } from "react";
import { bookingAPI, bookingUtils, Booking } from "@/lib/api/bookings";
import BookingEditModal from "./modals/BookingEditModal";
import DownloadReportModal from "./modals/DownloadReportModal";
import ProcessHistoryModal from "./modals/ProcessHistoryModal";
import AddBookingModal from "./modals/AddBookingModal";
import { Bay, bayAPI, bayUtils } from "@/lib/api/bays";

const BookingDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bays, setBays] = useState<Bay[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isProcessHistoryModalOpen, setIsProcessHistoryModalOpen] =
    useState(false);
  const [selectedBookingForHistory, setSelectedBookingForHistory] =
    useState<Booking | null>(null);
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);

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
      console.log("response", response);

      if (response.success && response.data) {
        if (response.success && response.data) {
          setBays(response.data);
        }
      } else {
        console.error("Failed fetching bays:", response.message);
      }
    } catch (error) {
      console.error("Error fetching bays:", error);
    }
  };

  // Fetch bookings data from API
  useEffect(() => {
    fetchBays();
  }, []);

  // Fetch bookings data from API
  useEffect(() => {
    fetchBookings();
  }, []);

  // Workflow functions
  const handleStatusTransition = async (booking: Booking, action: string) => {
    try {
      let response;

      switch (action) {
        case "Assign to Bay":
          response = await bookingAPI.workflow.assignToBay(
            booking.id,
            booking.bayId
          );
          break;
        case "Move to Next Job":
          response = await bookingAPI.workflow.moveToNextJob(booking.id);
          break;
        case "Start Job":
          response = await bookingAPI.workflow.startJob(
            booking.id,
            booking.jobStartTime || new Date().toISOString().split("T")[1],
            booking.jobEndTime ||
              new Date(Date.now() + 2 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[1]
          );
          break;
        case "Pause Job":
          response = await bookingAPI.workflow.pauseJob(booking.id);
          break;
        case "Resume Job":
          response = await bookingAPI.workflow.resumeJob(booking.id);
          break;
        case "Complete Job":
          response = await bookingAPI.workflow.completeJob(booking.id);
          break;
        default:
          return;
      }

      if (response.success && response.data) {
        setBookings((prevBookings) =>
          prevBookings.map((b) => (b.id === booking.id ? response.data! : b))
        );
      }
    } catch (error) {
      console.error("Failed to update booking status:", error);
    }
  };

  const getBookingPosition = (booking: Booking) => {
    const startTime = booking.jobStartTime || "08:00";
    const endTime = booking.jobEndTime || "10:00";
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

  const handleAddBooking = async (newBookingData: Omit<Booking, "id">) => {
    try {
      // Generate a unique ID for the new booking
      const newBooking: Booking = {
        ...newBookingData,
        id: Date.now(),
      };

      // Add to local state (in a real app, this would be an API call)
      setBookings((prevBookings) => [...prevBookings, newBooking]);
      setIsAddBookingModalOpen(false);

      // Here you would typically make an API call to save the booking
      // const response = await bookingAPI.createBooking(newBookingData);
      // if (response.success) {
      //   setBookings((prevBookings) => [...prevBookings, response.data]);
      //   setIsAddBookingModalOpen(false);
      // }
    } catch (error) {
      console.error("Failed to add booking:", error);
    }
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
            <button
              onClick={() => setIsAddBookingModalOpen(true)}
              className="btn-toyota-primary px-4 py-2 text-sm"
            >
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
                {bookings.filter((b) => b.status === "ACTIVE_BOARD").length}
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
                {bookings.filter((b) => b.status === "QUEUING").length}
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
                {bookings.filter((b) => b.status === "JOB_STOPPAGE").length}
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
                .filter((b) => b.status === "QUEUING")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.status
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.carRegNo}
                    </div>
                    <div className="text-xs truncate">
                      SVA: {booking.serviceAdvisorId}
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
            </div>
          </div>

          {/* Bay Queue Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-blue-50">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "BAY_QUEUE")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.status
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.carRegNo}
                    </div>
                    <div className="text-xs truncate">
                      SVA: {booking.serviceAdvisorId}
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
            </div>
          </div>

          {/* Next Job Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-purple-50">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "NEXT_JOB")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.status
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.carRegNo}
                    </div>
                    <div className="text-xs truncate">
                      SVA: {booking.serviceAdvisorId}
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
                      bay.status === "ACTIVE"
                        ? "bg-green-500"
                        : bay.status === "INACTIVE"
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
                .filter((b) => b.status === "JOB_STOPPAGE")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.status
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.carRegNo}
                    </div>
                    <div className="text-xs truncate">
                      SVA: {booking.serviceAdvisorId}
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
            </div>
          </div>

          {/* Repair Completion Column */}
          <div className="col-span-1 p-4 border-r-2 border-gray-300 bg-green-50">
            <div className="space-y-2">
              {bookings
                .filter((b) => b.status === "REPAIR_COMPLETION")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className={`p-2 rounded-lg border-l-4 shadow-sm ${bookingUtils.getStatusColor(
                      booking.status
                    )} cursor-pointer hover:shadow-lg transition-all duration-200`}
                    onClick={() => openModal(booking)}
                  >
                    <div className="text-xs font-bold truncate">
                      {booking.carRegNo}
                    </div>
                    <div className="text-xs truncate">
                      SVA: {booking.serviceAdvisorId}
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
            const bayBookings = getBookingsForBay(parseInt(bay.id));

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
                      .filter(
                        (b) =>
                          b.status === "ACTIVE_BOARD" ||
                          b.status === "JOB_STOPPAGE"
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
                            title={`Vehicle: ${booking.carRegNo} | SVA: ${
                              booking.serviceAdvisorId
                            } | Check-in: ${new Date(
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
                            <div className="p-4 h-full flex flex-col justify-between">
                              <div className="text-sm font-bold text-gray-900">
                                {booking.carRegNo}
                              </div>
                              <div className="text-xs text-gray-700">
                                SVA: {booking.serviceAdvisorId}
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
      <BookingEditModal
        open={isModalOpen && selectedBooking !== null}
        booking={selectedBooking!}
        onClose={closeModal}
        onSuccess={() => {
          closeModal();
          fetchBookings();
        }}
        onViewHistory={handleViewHistory}
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
        onAdd={handleAddBooking}
        processOptions={processOptions}
      />
    </div>
  );
};

export default BookingDashboard;
