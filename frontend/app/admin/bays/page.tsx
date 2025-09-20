"use client";

import React, { useState, useEffect } from "react";
import { Bay, bayAPI, bayUtils } from "@/lib/api/bays";
import AddBayModal from "./components/AddBayModal";
import EditBayModal from "./components/EditBayModal";
import DeleteBayDialog from "./components/DeleteBayDialog";

export default function AdminBaysPage() {
  const [bays, setBays] = useState<Bay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBay, setSelectedBay] = useState<Bay | null>(null);

  // Fetch bays data
  const fetchBays = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await bayAPI.getAllBays();

      if (response.success && response.data) {
        setBays(bayUtils.sortBays(response.data));
      } else {
        setError(response.message || "Failed to fetch bays");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBays();
  }, []);

  const handleAddBay = () => {
    setIsAddModalOpen(true);
  };

  const handleEditBay = (bay: Bay) => {
    setSelectedBay(bay);
    setIsEditModalOpen(true);
  };

  const handleDeleteBay = (bay: Bay) => {
    setSelectedBay(bay);
    setIsDeleteDialogOpen(true);
  };

  const handleModalSuccess = () => {
    // Refresh the bays list after successful add/edit
    fetchBays();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-toyota-black text-toyota-white py-6">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-toyota-red rounded-lg flex items-center justify-center">
                  <span className="text-toyota-white font-bold text-xl">T</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Branch Appointment System
                  </h1>
                  <p className="text-gray-300 text-sm">Admin Panel</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-toyota-red mx-auto"></div>
              <p className="mt-4 text-toyota-text-secondary">Loading bays...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-toyota-black text-toyota-white py-6">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-toyota-red rounded-lg flex items-center justify-center">
                  <span className="text-toyota-white font-bold text-xl">T</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Branch Appointment System
                  </h1>
                  <p className="text-gray-300 text-sm">Admin Panel</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Error State */}
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchBays}
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
      {/* Header */}
      <header className="bg-toyota-black text-toyota-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-toyota-red rounded-lg flex items-center justify-center">
                <span className="text-toyota-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Branch Appointment System
                </h1>
                <p className="text-gray-300 text-sm">Admin Panel</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="/admin/bays" className="text-toyota-red font-medium">
                Bay Management
              </a>
              <a
                href="/admin/technicians"
                className="hover:text-toyota-red transition-colors"
              >
                Technicians
              </a>
              <a
                href="/admin/categories"
                className="hover:text-toyota-red transition-colors"
              >
                Categories
              </a>
              <a
                href="/dashboard"
                className="hover:text-toyota-red transition-colors"
              >
                Dashboard
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-toyota-black">
              Bay Management
            </h2>
            <p className="text-toyota-text-secondary mt-2">
              Manage service bays for your appointment system
            </p>
          </div>
          <button
            onClick={handleAddBay}
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
            <span>Add Bay</span>
          </button>
        </div>

        {/* Bays Table */}
        <div className="card-toyota">
          {bays.length === 0 ? (
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-toyota-black mb-2">
                No Bays Found
              </h3>
              <p className="text-toyota-text-secondary mb-6">
                Get started by adding your first service bay
              </p>
              <button onClick={handleAddBay} className="btn-toyota-primary">
                Add Your First Bay
              </button>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-toyota-gray">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-toyota-text-secondary uppercase tracking-wider">
                      Bay ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-toyota-text-secondary uppercase tracking-wider">
                      Bay Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-toyota-text-secondary uppercase tracking-wider">
                      Bay No
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
                  {bays.map((bay, index) => {
                    const statusInfo = bayUtils.formatStatus(bay.bay_status);
                    return (
                      <tr
                        key={bay.bay_id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-toyota-black">
                          {bay.bay_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-toyota-black">
                          {bay.bay_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-toyota-black">
                          {bay.bay_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={statusInfo.className}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditBay(bay)}
                              className="text-toyota-red hover:text-toyota-red-dark transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBay(bay)}
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
        {bays.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-toyota text-center">
              <div className="text-2xl font-bold text-toyota-red mb-2">
                {bays.length}
              </div>
              <div className="text-toyota-text-secondary">Total Bays</div>
            </div>
            <div className="card-toyota text-center">
              <div className="text-2xl font-bold text-toyota-red mb-2">
                {bays.filter((bay) => bay.bay_status === "active").length}
              </div>
              <div className="text-toyota-text-secondary">Active Bays</div>
            </div>
            <div className="card-toyota text-center">
              <div className="text-2xl font-bold text-toyota-red mb-2">
                {bays.filter((bay) => bay.bay_status === "inactive").length}
              </div>
              <div className="text-toyota-text-secondary">Inactive Bays</div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddBayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <EditBayModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBay(null);
        }}
        onSuccess={handleModalSuccess}
        bay={selectedBay}
      />

      <DeleteBayDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedBay(null);
        }}
        onSuccess={handleModalSuccess}
        bay={selectedBay}
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
