'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-700 to-orange-500"></div>

      {/* Decorative gradient blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 text-balance">
          Discover Amazing Events
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
          Join thousands of people discovering and attending events near you
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/events">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 rounded-2xl text-lg transition transform hover:scale-105">
              Explore Events
            </Button>
          </Link>
          {!isAuthenticated && (
            <Link href="/signup">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold px-8 py-6 rounded-2xl text-lg transition">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
