"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const { user } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) return null;

  return (
    <nav className="bg-purple-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <a
              href="/"
              className="text-xl font-bold hover:text-purple-200 transition"
            >
              Servitor Workshop
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <a href="/" className="hover:text-purple-200 transition">
              Home
            </a>
            <a href="/servitor" className="hover:text-purple-200 transition">
              Create Servitor
            </a>
            <a href="/servitors" className="hover:text-purple-200 transition">
              My Servitors
            </a>
            <a href="/rituals" className="hover:text-purple-200 transition">
              Ritual Logs
            </a>
            <a href="/celestial" className="hover:text-purple-200 transition">
              Sigil Generator
            </a>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded transition"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 pb-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col space-y-3 pt-4 border-t border-purple-700">
            <a
              href="/"
              className="hover:text-purple-200 transition px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="/servitor"
              className="hover:text-purple-200 transition px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Servitor
            </a>
            <a
              href="/servitors"
              className="hover:text-purple-200 transition px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              My Servitors
            </a>
            <a
              href="/rituals"
              className="hover:text-purple-200 transition px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Ritual Logs
            </a>
            <a
              href="/celestial"
              className="hover:text-purple-200 transition px-2 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              Sigil Generator
            </a>
            <div className="pt-3 border-t border-purple-700">
              <span className="text-sm text-purple-200 px-2 py-1 block">
                {user.email}
              </span>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="mt-2 w-full bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded transition text-left"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
