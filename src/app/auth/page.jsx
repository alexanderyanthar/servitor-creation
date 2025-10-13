// src/app/auth/page.jsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        setMessage({ type: "success", text: "Logged in successfully!" });
        router.push("/");
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Account created! Please check your email to confirm your account.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 w-full max-w-md border border-purple-300 border-opacity-30">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-purple-200 mb-8 text-center">
          {isLogin
            ? "Sign in to access your servitors"
            : "Join the Servitor Workshop"}
        </p>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500 bg-opacity-20 text-green-100 border border-green-400"
                : "bg-red-500 bg-opacity-20 text-red-100 border border-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 text-black bg-white bg-opacity-20 border border-purple-300 border-opacity-30 rounded-lg focus:outline-none focus:border-purple-400 placeholder-purple-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-white bg-opacity-20 border border-purple-300 border-opacity-30 rounded-lg focus:outline-none focus:border-purple-400 text-black placeholder-purple-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-purple-800 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-300 hover:text-white transition"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
