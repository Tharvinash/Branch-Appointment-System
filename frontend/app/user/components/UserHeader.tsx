"use client";

import React from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface UserHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function UserHeader({ user, onLogout }: UserHeaderProps) {
  return (
    <header className="bg-toyota-black text-toyota-white py-6">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-toyota-red rounded-lg flex items-center justify-center">
              <span className="text-toyota-white font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Branch Appointment System</h1>
              <p className="text-gray-300 text-sm">
                Toyota Gazoo Racing Inspired
              </p>
            </div>
          </div>

          {/* User Info and Logout - No navigation tabs for users */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-300">Welcome, {user?.name}</div>
              <div className="text-xs text-gray-400 capitalize">
                {user?.role}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="btn-toyota-outline text-sm px-4 py-2 flex items-center space-x-2 hover:bg-red-600 hover:text-white transition-all duration-200 ease-in-out"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
