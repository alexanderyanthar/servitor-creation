"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const navLinks = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/servitor", label: "Create Servitor", icon: "✨" },
    { href: "/servitors", label: "My Servitors", icon: "📚" },
    { href: "/celestial", label: "Sigil Generator", icon: "🔮" },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <nav className="bg-purple-900 bg-opacity-90 backdrop-blur-lg border-b border-purple-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌟</span>
            <span className="text-white font-bold text-xl hidden sm:inline">
              Servitor Workshop
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg transition flex items-center space-x-1 text-sm ${
                    isActive
                      ? "bg-purple-700 text-white"
                      : "text-purple-200 hover:bg-purple-800 hover:text-white"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-2 ml-2">
                <span className="text-purple-200 text-sm hidden lg:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="ml-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
