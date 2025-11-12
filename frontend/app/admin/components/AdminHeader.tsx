"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AdminHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function AdminHeader({ user, onLogout }: AdminHeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-toyota-black text-toyota-white py-6">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 pr-4">
            <div className="h-11">
              <img
                src="/Toyota_carlogo.svg"
                alt="Toyota Logo"
                className="h-full w-auto"
              />
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <nav className="hidden md:flex space-x-3">
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ease-in-out flex items-center text-center ${
                isActive("/admin")
                  ? "bg-toyota-red text-toyota-white shadow-md"
                  : "hover:text-toyota-red hover:bg-gray-800/50"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/bays"
              className={`px-2 py-2 rounded-lg transition-all duration-200 ease-in-out flex items-center text-center ${
                isActive("/admin/bays")
                  ? "bg-toyota-red text-toyota-white shadow-md"
                  : "hover:text-toyota-red hover:bg-gray-800/50"
              }`}
            >
              Bay Management
            </Link>
            <Link
              href="/admin/technicians"
              className={`px-2 py-2 rounded-lg transition-all duration-200 ease-in-out flex items-center text-center ${
                isActive("/admin/technicians")
                  ? "bg-toyota-red text-toyota-white shadow-md"
                  : "hover:text-toyota-red hover:bg-gray-800/50"
              }`}
            >
              Technician Management
            </Link>
            <Link
              href="/admin/service-advisors"
              className={`px-2 py-2 rounded-lg transition-all duration-200 ease-in-out flex items-center text-center ${
                isActive("/admin/service-advisors")
                  ? "bg-toyota-red text-toyota-white shadow-md"
                  : "hover:text-toyota-red hover:bg-gray-800/50"
              }`}
            >
              Service Advisor Management
            </Link>
          </nav>

          {/* User Info and Logout */}
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

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4">
          <div className="flex flex-col space-y-4">
            <nav className="flex flex-wrap gap-2">
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ease-in-out ${
                  isActive("/admin")
                    ? "bg-toyota-red text-toyota-white shadow-md"
                    : "hover:text-toyota-red hover:bg-gray-800/50"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/bays"
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ease-in-out ${
                  isActive("/admin/bays")
                    ? "bg-toyota-red text-toyota-white shadow-md"
                    : "hover:text-toyota-red hover:bg-gray-800/50"
                }`}
              >
                Bay Management
              </Link>
              <Link
                href="/admin/technicians"
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ease-in-out ${
                  isActive("/admin/technicians")
                    ? "bg-toyota-red text-toyota-white shadow-md"
                    : "hover:text-toyota-red hover:bg-gray-800/50"
                }`}
              >
                Technician Management
              </Link>
              <Link
                href="/admin/service-advisors"
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ease-in-out ${
                  isActive("/admin/service-advisors")
                    ? "bg-toyota-red text-toyota-white shadow-md"
                    : "hover:text-toyota-red hover:bg-gray-800/50"
                }`}
              >
                Service Advisor Management
              </Link>
            </nav>

            {/* Mobile User Info and Logout */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <div className="text-sm text-gray-300">
                <div>Welcome, {user?.name}</div>
                <div className="text-xs text-gray-400 capitalize">
                  {user?.role}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="btn-toyota-outline text-sm px-3 py-2 flex items-center space-x-2 hover:bg-red-600 hover:text-white transition-all duration-200 ease-in-out"
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
      </div>
    </header>
  );
}
