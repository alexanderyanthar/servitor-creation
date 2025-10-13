// src/app/servitors/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MyServitors = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [servitors, setServitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServitor, setSelectedServitor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchServitors();
  }, [user, router]);

  const fetchServitors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("servitors")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServitors(data || []);
    } catch (error) {
      console.error("Error fetching servitors:", error);
      setMessage({ type: "error", text: "Error loading servitors" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (
      !confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("servitors").delete().eq("id", id);

      if (error) throw error;

      setMessage({ type: "success", text: "Servitor deleted successfully" });
      fetchServitors();
      setSelectedServitor(null);
    } catch (error) {
      console.error("Error deleting servitor:", error);
      setMessage({ type: "error", text: "Error deleting servitor" });
    }
  };

  const handleEdit = (servitor) => {
    setEditData({
      id: servitor.id,
      name: servitor.name,
      purpose: servitor.purpose,
      powers: servitor.powers || "",
      timing: servitor.timing,
      appearance: servitor.appearance || "",
      call: servitor.call || "",
      sustenance: servitor.sustenance || "",
      location: servitor.location || "",
      fatal_flaw: servitor.fatal_flaw,
    });
    setIsEditing(true);
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (
      !editData.name.trim() ||
      !editData.purpose.trim() ||
      !editData.fatal_flaw.trim()
    ) {
      setMessage({
        type: "error",
        text: "Name, Purpose, and Fatal Flaw are required",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("servitors")
        .update({
          name: editData.name,
          purpose: editData.purpose,
          powers: editData.powers || null,
          timing: editData.timing,
          appearance: editData.appearance || null,
          call: editData.call || null,
          sustenance: editData.sustenance || null,
          location: editData.location || null,
          fatal_flaw: editData.fatal_flaw,
        })
        .eq("id", editData.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Servitor updated successfully" });
      setIsEditing(false);
      setEditData(null);
      setSelectedServitor(null);
      fetchServitors();
    } catch (error) {
      console.error("Error updating servitor:", error);
      setMessage({ type: "error", text: "Error updating servitor" });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const getTimingLabel = (timing) => {
    const labels = {
      constant: "Constant",
      "single-use": "Single Use",
      "multi-use": "Multi-Use",
    };
    return labels[timing] || timing;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading your servitors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Servitors</h1>
            <p className="text-gray-600 mt-1">
              {servitors.length}{" "}
              {servitors.length === 1 ? "servitor" : "servitors"} created
            </p>
          </div>
          <Link
            href="/servitor"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            + Create New Servitor
          </Link>
        </div>

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

        {/* Servitors List */}
        {servitors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No servitors yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first servitor to get started
            </p>
            <Link
              href="/servitor"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Create Your First Servitor
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servitors.map((servitor) => (
              <div
                key={servitor.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
                onClick={() => setSelectedServitor(servitor)}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {servitor.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Timing:</span>{" "}
                    {getTimingLabel(servitor.timing)}
                  </div>
                  <div>
                    <span className="font-semibold">Purpose:</span>
                    <p className="line-clamp-2 mt-1">{servitor.purpose}</p>
                  </div>
                  <div className="text-xs text-gray-400 mt-3">
                    Created:{" "}
                    {new Date(servitor.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Servitor Detail Modal */}
        {selectedServitor && !isEditing && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedServitor(null)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      {selectedServitor.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Created:{" "}
                      {new Date(
                        selectedServitor.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedServitor(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Purpose
                    </h3>
                    <p className="text-gray-700">{selectedServitor.purpose}</p>
                  </div>

                  {selectedServitor.powers && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Powers
                      </h3>
                      <p className="text-gray-700">{selectedServitor.powers}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Timing of Action
                    </h3>
                    <p className="text-gray-700">
                      {getTimingLabel(selectedServitor.timing)}
                    </p>
                  </div>

                  {selectedServitor.appearance && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Appearance
                      </h3>
                      <p className="text-gray-700">
                        {selectedServitor.appearance}
                      </p>
                    </div>
                  )}

                  {selectedServitor.call && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Call/Activation Method
                      </h3>
                      <p className="text-gray-700">{selectedServitor.call}</p>
                    </div>
                  )}

                  {selectedServitor.sustenance && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Sustenance
                      </h3>
                      <p className="text-gray-700">
                        {selectedServitor.sustenance}
                      </p>
                    </div>
                  )}

                  {selectedServitor.location && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Location
                      </h3>
                      <p className="text-gray-700">
                        {selectedServitor.location}
                      </p>
                    </div>
                  )}

                  {selectedServitor.fatal_flaw && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Fatal Flaw
                      </h3>
                      <p className="text-gray-700">
                        {selectedServitor.fatal_flaw}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-8 pt-6 border-t">
                  <button
                    onClick={() => handleEdit(selectedServitor)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Edit Servitor
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(selectedServitor.id, selectedServitor.name)
                    }
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Delete Servitor
                  </button>
                  <button
                    onClick={() => setSelectedServitor(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && editData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCancelEdit}
          >
            <div
              className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Edit Servitor
                </h2>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servitor Name *
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose *
                    </label>
                    <textarea
                      value={editData.purpose}
                      onChange={(e) =>
                        handleEditChange("purpose", e.target.value)
                      }
                      rows="4"
                      className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Powers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Powers
                    </label>
                    <textarea
                      value={editData.powers}
                      onChange={(e) =>
                        handleEditChange("powers", e.target.value)
                      }
                      rows="3"
                      className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Timing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timing of Action *
                    </label>
                    <select
                      value={editData.timing}
                      onChange={(e) =>
                        handleEditChange("timing", e.target.value)
                      }
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

                  {/* Appearance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appearance
                    </label>
                    <textarea
                      value={editData.appearance}
                      onChange={(e) =>
                        handleEditChange("appearance", e.target.value)
                      }
                      rows="3"
                      className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Call */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call/Activation Method
                    </label>
                    <textarea
                      value={editData.call}
                      onChange={(e) => handleEditChange("call", e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Sustenance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sustenance
                    </label>
                    <textarea
                      value={editData.sustenance}
                      onChange={(e) =>
                        handleEditChange("sustenance", e.target.value)
                      }
                      rows="3"
                      className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <textarea
                      value={editData.location}
                      onChange={(e) =>
                        handleEditChange("location", e.target.value)
                      }
                      rows="2"
                      className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Fatal Flaw */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fatal Flaw *
                    </label>
                    <textarea
                      value={editData.fatal_flaw}
                      onChange={(e) =>
                        handleEditChange("fatal_flaw", e.target.value)
                      }
                      rows="3"
                      className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 pt-6 border-t">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServitors;
