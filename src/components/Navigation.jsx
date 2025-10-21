"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!user) return null;

  return (
    <nav className="bg-purple-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-8">
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
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
