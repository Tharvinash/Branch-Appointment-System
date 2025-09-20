"use client";

import React, { useState, useEffect } from "react";
import {
  Technician,
  technicianAPI,
  technicianUtils,
} from "@/lib/api/technicians";
import { authAPI, tokenManager, navigation } from "@/lib/auth";
import AdminHeader from "../components/AdminHeader";
import AddTechnicianModal from "./components/AddTechnicianModal";
import EditTechnicianModal from "./components/EditTechnicianModal";
import DeleteTechnicianDialog from "./components/DeleteTechnicianDialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Check authentication and fetch user data
  useEffect(() => {
    if (!tokenManager.isAuthenticated()) {
      navigation.redirectToLogin();
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.success && response.user) {
          if (response.user.role !== "admin") {
            navigation.redirectToDashboard(response.user.role);
            return;
          }
          setUser(response.user);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch technicians data
  const fetchTechnicians = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await technicianAPI.getAllTechnicians();

      if (response.success && response.data) {
        setTechnicians(technicianUtils.sortTechnicians(response.data));
      } else {
        setError(response.message || "Failed to fetch technicians");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTechnicians();
    }
  }, [user]);

  const handleAddTechnician = () => {
    setIsAddModalOpen(true);
  };

  const handleEditTechnician = (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsEditModalOpen(true);
  };

  const handleDeleteTechnician = (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsDeleteDialogOpen(true);
  };

  const handleModalSuccess = () => {
    // Refresh the technicians list after successful add/edit
    fetchTechnicians();
  };

  const handleLogout = () => {
    authAPI.logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-toyota-red mx-auto"></div>
          <p className="mt-4 text-toyota-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <AdminHeader user={user} onLogout={handleLogout} />

        {/* Loading State */}
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-toyota-red mx-auto"></div>
              <p className="mt-4 text-toyota-text-secondary">
                Loading technicians...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <AdminHeader user={user} onLogout={handleLogout} />

        {/* Error State */}
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchTechnicians}
                  className="mt-2 text-sm text-toyota-red hover:text-toyota-red-dark transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-toyota-black">
              Technician Management
            </h2>
            <p className="text-toyota-text-secondary mt-2">
              Manage technicians for your appointment system
            </p>
          </div>
          <button
            onClick={handleAddTechnician}
            className="btn-toyota-primary flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add Technician</span>
          </button>
        </div>

        {/* Technicians Table */}
        <div className="card-toyota">
          {technicians.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-toyota-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-toyota-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-toyota-black mb-2">
                No Technicians Found
              </h3>
              <p className="text-toyota-text-secondary mb-6">
                Get started by adding your first technician
              </p>
              <button
                onClick={handleAddTechnician}
                className="btn-toyota-primary"
              >
                Add Your First Technician
              </button>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-toyota-gray">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-toyota-text-secondary uppercase tracking-wider">
                      Technician ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-toyota-text-secondary uppercase tracking-wider">
                      Technician Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-toyota-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-toyota-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {technicians.map((technician, index) => {
                    const statusInfo = technicianUtils.formatStatus(
                      technician.technician_status
                    );
                    return (
                      <tr
                        key={technician.technician_id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-toyota-black">
                          {technician.technician_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-toyota-black">
                          {technician.technician_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={statusInfo.className}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTechnician(technician)}
                              className="text-toyota-red hover:text-toyota-red-dark transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTechnician(technician)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        {technicians.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-toyota text-center">
              <div className="text-2xl font-bold text-toyota-red mb-2">
                {technicians.length}
              </div>
              <div className="text-toyota-text-secondary">
                Total Technicians
              </div>
            </div>
            <div className="card-toyota text-center">
              <div className="text-2xl font-bold text-toyota-red mb-2">
                {
                  technicians.filter((t) => t.technician_status === "active")
                    .length
                }
              </div>
              <div className="text-toyota-text-secondary">
                Active Technicians
              </div>
            </div>
            <div className="card-toyota text-center">
              <div className="text-2xl font-bold text-toyota-red mb-2">
                {
                  technicians.filter((t) => t.technician_status === "inactive")
                    .length
                }
              </div>
              <div className="text-toyota-text-secondary">
                Inactive Technicians
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddTechnicianModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <EditTechnicianModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTechnician(null);
        }}
        onSuccess={handleModalSuccess}
        technician={selectedTechnician}
      />

      <DeleteTechnicianDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTechnician(null);
        }}
        onSuccess={handleModalSuccess}
        technician={selectedTechnician}
      />

      {/* Footer */}
      <footer className="bg-toyota-black text-toyota-white py-8 mt-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-toyota-red rounded flex items-center justify-center">
                <span className="text-toyota-white font-bold">T</span>
              </div>
              <span className="text-gray-300">
                © 2024 Branch Appointment System
              </span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-toyota-red transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-toyota-red transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-toyota-red transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
