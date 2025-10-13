"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import jsPDF to avoid SSR issues
const jsPDF = dynamic(() => import("jspdf").then((mod) => mod.default), {
  ssr: false,
});

const ServitorCreation = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [servitorData, setServitorData] = useState({
    name: "",
    purpose: "",
    powers: "",
    timing: "constant",
    appearance: "",
    call: "",
    sustenance: "",
    location: "",
    fatalFlaw: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (field, value) => {
    setServitorData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!servitorData.name.trim()) {
      setMessage({ type: "error", text: "Name is required" });
      return false;
    }
    if (!servitorData.purpose.trim()) {
      setMessage({ type: "error", text: "Purpose is required" });
      return false;
    }
    if (!servitorData.fatalFlaw.trim()) {
      setMessage({ type: "error", text: "Fatal Flaw is required" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    console.log("Current user:", user);
    console.log("User ID:", user?.id);

    if (!user) {
      setMessage({
        type: "error",
        text: "You must be logged in to save servitors",
      });
      router.push("/auth");
      return;
    }

    if (!validateForm()) return;

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const dataToInsert = {
        user_id: user.id,
        name: servitorData.name,
        purpose: servitorData.purpose,
        powers: servitorData.powers || null,
        timing: servitorData.timing,
        appearance: servitorData.appearance || null,
        call: servitorData.call || null,
        sustenance: servitorData.sustenance || null,
        location: servitorData.location || null,
        fatal_flaw: servitorData.fatalFlaw,
      };

      console.log("Data being inserted:", dataToInsert);

      const { data, error } = await supabase
        .from("servitors")
        .insert([dataToInsert])
        .select();

      console.log("Supabase response:", { data, error });

      if (error) throw error;

      setMessage({ type: "success", text: "Servitor saved successfully!" });
    } catch (error) {
      console.error("Error saving servitor:", error);
      setMessage({ type: "error", text: `Error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    console.log("Export PDF clicked");
    console.log("Servitor data:", servitorData);

    if (!servitorData.name.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a servitor name before exporting",
      });
      return;
    }

    console.log("Starting PDF generation...");

    try {
      // Dynamically import jsPDF
      console.log("Importing jsPDF...");
      const { default: jsPDF } = await import("jspdf");
      console.log("jsPDF imported successfully");

      const doc = new jsPDF();
      console.log("jsPDF instance created");

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let yPosition = 20;

      // Title
      doc.setFontSize(24);
      doc.setFont(undefined, "bold");
      doc.text("Servitor Documentation", margin, yPosition);
      yPosition += 15;

      // Servitor Name
      doc.setFontSize(18);
      doc.text(servitorData.name || "Unnamed Servitor", margin, yPosition);
      yPosition += 12;

      // Horizontal line
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Helper function to add sections
      const addSection = (title, content) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text(title, margin, yPosition);
        yPosition += 7;

        doc.setFontSize(11);
        doc.setFont(undefined, "normal");

        if (content && content.trim()) {
          const lines = doc.splitTextToSize(content, maxWidth);
          doc.text(lines, margin, yPosition);
          yPosition += lines.length * 5 + 5;
        } else {
          doc.setTextColor(150);
          doc.text("Not specified", margin, yPosition);
          doc.setTextColor(0);
          yPosition += 10;
        }
      };

      console.log("Adding sections to PDF...");

      // Add all sections
      addSection("Purpose", servitorData.purpose);
      addSection("Powers", servitorData.powers);

      // Timing with readable format
      const timingText =
        {
          constant: "Constant - Always active and working",
          "single-use": "Single Use - Completes task once then dissolves",
          "multi-use": "Multi-Use - Only acts when called upon",
        }[servitorData.timing] || servitorData.timing;
      addSection("Timing of Action", timingText);

      addSection("Appearance", servitorData.appearance);
      addSection("Call/Activation Method", servitorData.call);
      addSection("Sustenance", servitorData.sustenance);
      addSection("Location", servitorData.location);
      addSection("Fatal Flaw", servitorData.fatalFlaw);

      console.log("Sections added, adding footer...");

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100);
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Created: ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
          margin,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      // Save the PDF
      const fileName = `${servitorData.name.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_Servitor.pdf`;
      console.log("Saving PDF as:", fileName);
      doc.save(fileName);

      console.log("PDF saved successfully!");
      setMessage({ type: "success", text: "PDF exported successfully!" });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setMessage({
        type: "error",
        text: `Error exporting PDF: ${error.message}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Servitor Creation
          </h1>
          <p className="text-gray-600 mb-8">
            Design and document your magical servitor
          </p>

          {/* Success/Error Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Name and Call */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              The Name and Call
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servitor Name *
                </label>
                <input
                  type="text"
                  value={servitorData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Solara, Aurora, Vesper"
                  className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call/Activation Method
                </label>
                <textarea
                  value={servitorData.call}
                  onChange={(e) => handleChange("call", e.target.value)}
                  placeholder="How do you summon/activate this servitor? (e.g., word of power, physical symbol like bull horns, specific gesture, sigil activation)"
                  rows="3"
                  className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Purpose */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Purpose
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                The Reason for Existing *
              </label>
              <textarea
                value={servitorData.purpose}
                onChange={(e) => handleChange("purpose", e.target.value)}
                placeholder="What is this servitor's primary reason for existence? What task or role does it fulfill?"
                rows="4"
                className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* Powers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Powers
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Powers Needed
              </label>
              <textarea
                value={servitorData.powers}
                onChange={(e) => handleChange("powers", e.target.value)}
                placeholder="What powers or abilities does this servitor need to accomplish its purpose? (Can be left blank if none needed)"
                rows="4"
                className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* Timing of Action */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Timing of Action
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When does this servitor act? *
              </label>
              <select
                value={servitorData.timing}
                onChange={(e) => handleChange("timing", e.target.value)}
                className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="constant">
                  Constant - Always active and working
                </option>
                <option value="single-use">
                  Single Use - Completes task once then dissolves
                </option>
                <option value="multi-use">
                  Multi-Use - Only acts when called upon
                </option>
              </select>
            </div>
          </section>

          {/* Appearance */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Appearance
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appearance of Servitor
              </label>
              <textarea
                value={servitorData.appearance}
                onChange={(e) => handleChange("appearance", e.target.value)}
                placeholder="Describe how this servitor appears (colors, forms, symbols, energy, etc.)"
                rows="4"
                className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* Sustenance */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Sustenance
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How Will You Feed the Servitor?
              </label>
              <textarea
                value={servitorData.sustenance}
                onChange={(e) => handleChange("sustenance", e.target.value)}
                placeholder="What sustains this servitor? (e.g., emotions like gratitude or joy, events like meditation sessions, physical offerings like food/drink/incense, experiences, your own energy)"
                rows="4"
                className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* Location */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Location
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Where is the Servitor Housed?
              </label>
              <textarea
                value={servitorData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Where does this servitor reside? (e.g., a specific object, crystal, talisman, drawing, place in your home, or entirely astral/energetic)"
                rows="3"
                className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* The Fatal Flaw */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              The Fatal Flaw
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Method for Removing Servitor *
              </label>
              <textarea
                value={servitorData.fatalFlaw}
                onChange={(e) => handleChange("fatalFlaw", e.target.value)}
                placeholder="In the worst case scenario, how can this servitor be completely removed or destroyed? (e.g., specific banishing phrase, destroying the housing object, a ritual, cutting off sustenance for X days)"
                rows="4"
                className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition">
              Generate Sigil
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Servitor"}
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Export as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServitorCreation;
