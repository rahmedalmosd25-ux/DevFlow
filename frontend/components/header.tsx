'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-gradient-to-b from-blue-900 to-transparent z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-900 rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-2xl font-bold text-white">DevFlow</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-white hover:text-gray-200 transition">
            Home
          </Link>
          <Link href="/events" className="text-white hover:text-gray-200 transition">
            Events
          </Link>
          {isAuthenticated && (
          <Link href="/add-event" className="text-white hover:text-gray-200 transition">
            Add Event
          </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link href="/admin" className="text-white hover:text-gray-200 transition">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
          <Link href="/profile">
            <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </button>
          </Link>
              <div className="text-white text-sm hidden md:block">
                {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="text-white hover:text-gray-200 font-semibold px-4 py-2 transition">
                  Login
                </button>
              </Link>
          <Link href="/signup">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition">
              Sign Up
            </button>
          </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
