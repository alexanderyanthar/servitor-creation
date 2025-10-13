"use client";

import React from "react";
import Link from "next/link";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            Servitor Workshop
          </h1>
          <p className="text-xl text-purple-200">
            Create and manage your magical servitors
          </p>
        </header>

        {/* Main Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Create Servitor Card */}
          <Link href="/servitor">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 hover:bg-opacity-20 transition cursor-pointer border border-purple-300 border-opacity-30">
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Create Servitor
              </h2>
              <p className="text-purple-200">
                Design a new servitor with custom attributes, purpose, and
                characteristics
              </p>
            </div>
          </Link>

          {/* Generate Sigil Card */}
          <Link href="/celestial">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 hover:bg-opacity-20 transition cursor-pointer border border-purple-300 border-opacity-30">
              <div className="text-5xl mb-4">🔮</div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Celestial Sigil Generator
              </h2>
              <p className="text-purple-200">
                Create sigils using the celestial alphabet wheel
              </p>
            </div>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-xl p-6 border border-purple-300 border-opacity-20">
            <h3 className="text-lg font-semibold text-white mb-2">
              What is a Servitor?
            </h3>
            <p className="text-purple-200 text-sm">
              A servitor is a thoughtform or magical construct created to
              perform specific tasks. Through focused intention and symbolic
              representation, you can create entities to assist with protection,
              guidance, manifestation, and other magical workings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
