// src/app/servitor/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import jsPDF from "jspdf";

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

export default function CreateServitor() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    call: "",
    purpose: "",
    powers: "",
    timing: "constant",
    appearance: "",
    sustenance: "",
    location: "",
    fatal_flaw: "",
    zodiac_sign: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to create a servitor");
      return;
    }

    const { data, error } = await supabase
      .from("servitors")
      .insert([
        {
          ...formData,
          user_id: user.id,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating servitor:", error);
      alert("Error creating servitor");
    } else {
      alert("Servitor created successfully!");
      setFormData({
        name: "",
        call: "",
        purpose: "",
        powers: "",
        timing: "constant",
        appearance: "",
        sustenance: "",
        location: "",
        fatal_flaw: "",
        zodiac_sign: "",
      });
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Servitor Creation Record", 20, 20);

    doc.setFontSize(12);
    let yPos = 40;

    doc.text(`Name: ${formData.name}`, 20, yPos);
    yPos += 10;
    doc.text(`Call: ${formData.call}`, 20, yPos);
    yPos += 10;
    doc.text(`Purpose: ${formData.purpose}`, 20, yPos);
    yPos += 10;
    doc.text(`Powers: ${formData.powers}`, 20, yPos);
    yPos += 10;
    doc.text(`Timing: ${formData.timing}`, 20, yPos);
    yPos += 10;
    doc.text(`Appearance: ${formData.appearance}`, 20, yPos);
    yPos += 10;
    doc.text(`Sustenance: ${formData.sustenance}`, 20, yPos);
    yPos += 10;
    doc.text(`Location: ${formData.location}`, 20, yPos);
    yPos += 10;
    doc.text(`Fatal Flaw: ${formData.fatal_flaw}`, 20, yPos);
    yPos += 10;
    doc.text(`Zodiac Sign: ${formData.zodiac_sign}`, 20, yPos);

    doc.save(`${formData.name || "servitor"}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Create a Servitor
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call (How to summon)
            </label>
            <input
              type="text"
              value={formData.call}
              onChange={(e) =>
                setFormData({ ...formData, call: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose *
            </label>
            <textarea
              required
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Powers
            </label>
            <textarea
              value={formData.powers}
              onChange={(e) =>
                setFormData({ ...formData, powers: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timing *
            </label>
            <select
              required
              value={formData.timing}
              onChange={(e) =>
                setFormData({ ...formData, timing: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="constant">Constant</option>
              <option value="single-use">Single Use</option>
              <option value="multi-use">Multi-Use</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zodiac Sign
            </label>
            <select
              value={formData.zodiac_sign}
              onChange={(e) =>
                setFormData({ ...formData, zodiac_sign: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a zodiac sign (optional)</option>
              {ZODIAC_SIGNS.map((sign) => (
                <option key={sign} value={sign}>
                  {sign}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appearance
            </label>
            <textarea
              value={formData.appearance}
              onChange={(e) =>
                setFormData({ ...formData, appearance: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sustenance
            </label>
            <input
              type="text"
              value={formData.sustenance}
              onChange={(e) =>
                setFormData({ ...formData, sustenance: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fatal Flaw *
            </label>
            <textarea
              required
              value={formData.fatal_flaw}
              onChange={(e) =>
                setFormData({ ...formData, fatal_flaw: e.target.value })
              }
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 transition font-medium"
            >
              Create Servitor
            </button>

            <button
              type="button"
              onClick={exportPDF}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition font-medium"
            >
              Export as PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
