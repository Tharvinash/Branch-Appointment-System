"use client";

import React, { useState, useEffect } from "react";
import { authAPI, tokenManager, navigation } from "@/lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is authenticated
    if (!tokenManager.isAuthenticated()) {
      navigation.redirectToLogin();
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          setError(response.message || "Failed to load user data");
        }
      } catch (error) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    authAPI.logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-toyota-red mx-auto"></div>
          <p className="mt-4 text-toyota-text-secondary">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-toyota-red hover:text-toyota-red-dark transition-colors"
            >
              Try again
            </button>
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
                <p className="text-gray-300 text-sm">
                  Toyota Gazoo Racing Inspired
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Welcome, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="btn-toyota-outline text-sm px-4 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-toyota-black mb-4">
            Welcome to the Racing Experience
          </h2>
          <p className="text-xl text-toyota-text-secondary max-w-2xl mx-auto">
            You're now part of the Toyota Gazoo Racing team. Let's get your
            appointments scheduled with precision and speed.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Quick Actions */}
          <div className="card-toyota">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-toyota-red rounded-lg flex items-center justify-center mr-4">
                <span className="text-toyota-white text-xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-toyota-black">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-3">
              <button className="w-full btn-toyota-primary text-left">
                Book New Appointment
              </button>
              <button className="w-full btn-toyota-outline text-left">
                View My Appointments
              </button>
              <button className="w-full btn-toyota-outline text-left">
                Find Technicians
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-toyota">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-toyota-black rounded-lg flex items-center justify-center mr-4">
                <span className="text-toyota-white text-xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-toyota-black">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-toyota-text-secondary">
                <p>No recent appointments</p>
                <p className="text-xs mt-1">
                  Start by booking your first appointment
                </p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="card-toyota">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-toyota-red rounded-lg flex items-center justify-center mr-4">
                <span className="text-toyota-white text-xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold text-toyota-black">
                Account Info
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-toyota-text-secondary">Name:</span>
                <span className="ml-2 text-toyota-black font-medium">
                  {user?.name}
                </span>
              </div>
              <div>
                <span className="text-toyota-text-secondary">Email:</span>
                <span className="ml-2 text-toyota-black font-medium">
                  {user?.email}
                </span>
              </div>
              <div>
                <span className="text-toyota-text-secondary">
                  Member since:
                </span>
                <span className="ml-2 text-toyota-black font-medium">
                  Today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-toyota-gray rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-toyota-black text-center mb-8">
            Your Racing Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-toyota-red mb-2">0</div>
              <div className="text-toyota-text-secondary">Appointments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-toyota-red mb-2">0</div>
              <div className="text-toyota-text-secondary">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-toyota-red mb-2">0</div>
              <div className="text-toyota-text-secondary">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-toyota-red mb-2">
                100%
              </div>
              <div className="text-toyota-text-secondary">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-toyota-black text-toyota-white rounded-2xl p-12">
            <h3 className="text-3xl font-bold mb-4">Ready to Race?</h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Book your first appointment and experience the speed and precision
              of Toyota Gazoo Racing service.
            </p>
            <button className="btn-toyota-primary text-lg px-8 py-4">
              Book Your First Appointment
            </button>
          </div>
        </div>
      </main>

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
