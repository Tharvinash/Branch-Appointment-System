import React from "react";
import { ThemeProvider } from "./components/ThemeProvider";

export default function Home() {
  return (
    <ThemeProvider>
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
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="hover:text-toyota-red transition-colors">
                  Dashboard
                </a>
                <a href="#" className="hover:text-toyota-red transition-colors">
                  Appointments
                </a>
                <a href="#" className="hover:text-toyota-red transition-colors">
                  Technicians
                </a>
                <a href="#" className="hover:text-toyota-red transition-colors">
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h2 className="text-5xl font-bold text-toyota-black mb-6">
              Welcome to the
              <span className="text-toyota-red block">Racing Experience</span>
            </h2>
            <p className="text-xl text-toyota-text-secondary max-w-2xl mx-auto mb-8">
              Experience the speed and precision of Toyota Gazoo Racing in your
              appointment scheduling system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/login" className="btn-toyota-primary text-center">
                Sign In
              </a>
              <a href="/register" className="btn-toyota-outline text-center">
                Get Started
              </a>
            </div>
          </section>

          {/* Feature Cards */}
          <section className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card-toyota text-center">
              <div className="w-16 h-16 bg-toyota-red rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-toyota-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-toyota-black mb-3">
                Lightning Fast
              </h3>
              <p className="text-toyota-text-secondary">
                Book appointments with the speed and efficiency of a racing pit
                stop.
              </p>
            </div>

            <div className="card-toyota text-center">
              <div className="w-16 h-16 bg-toyota-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-toyota-white text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-toyota-black mb-3">
                Precision Timing
              </h3>
              <p className="text-toyota-text-secondary">
                Every appointment is scheduled with the precision of a racing
                lap time.
              </p>
            </div>

            <div className="card-toyota text-center">
              <div className="w-16 h-16 bg-toyota-red rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-toyota-white text-2xl">🏁</span>
              </div>
              <h3 className="text-xl font-semibold text-toyota-black mb-3">
                Race Ready
              </h3>
              <p className="text-toyota-text-secondary">
                Your team is always ready to perform at the highest level.
              </p>
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-toyota-gray rounded-2xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-toyota-black text-center mb-8">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-toyota-red mb-2">
                  99.9%
                </div>
                <div className="text-toyota-text-secondary">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-toyota-red mb-2">
                  2.3s
                </div>
                <div className="text-toyota-text-secondary">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-toyota-red mb-2">
                  1,247
                </div>
                <div className="text-toyota-text-secondary">Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-toyota-red mb-2">
                  24/7
                </div>
                <div className="text-toyota-text-secondary">Support</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-toyota-black text-toyota-white rounded-2xl p-12">
              <h3 className="text-3xl font-bold mb-4">Ready to Race?</h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl flex w-full">
                Join the Toyota Gazoo Racing experience and take your
                appointment scheduling to the next level.
              </p>
              <button className="btn-toyota-primary text-lg px-8 py-4">
                Get Started Now
              </button>
            </div>
          </section>
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
    </ThemeProvider>
  );
}
