"use client";

import React, { useState, useEffect } from "react";
import { authAPI, tokenManager, navigation } from "@/lib/auth";
import UserHeader from "./components/UserHeader";
import Dashboard from "../components/Dashboard";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export default function UserPage() {
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
          // Check if user is regular user
          if (response.user.role !== "user") {
            // Redirect admin users to their appropriate dashboard
            navigation.redirectToDashboard(response.user.role);
            return;
          }
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
            Loading user dashboard...
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
      <UserHeader user={user} onLogout={handleLogout} />

      <Dashboard user={user} onLogout={handleLogout} />
    </div>
  );
}
