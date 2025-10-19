"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import SigilGenerator from "@/components/SigilGenerator";

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

export default function MyServitors() {
  const { user } = useAuth();
  const [servitors, setServitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServitor, setSelectedServitor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [generatedSigil, setGeneratedSigil] = useState(null);

  useEffect(() => {
    if (user) {
      fetchServitors();
    }
  }, [user]);

  const fetchServitors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("servitors")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching servitors:", error);
    } else {
      setServitors(data);
    }
    setLoading(false);
  };

  const handleEdit = (servitor) => {
    setEditData({ ...servitor });
    setIsEditing(true);
  };

  const handleSigilGenerated = (sigil) => {
    setGeneratedSigil(sigil);
  };

  const handleGenerateSigil = async () => {
    if (!selectedServitor || !generatedSigil) return;

    const { error } = await supabase
      .from("servitors")
      .update({ sigil_image: generatedSigil })
      .eq("id", selectedServitor.id);

    if (error) {
      console.error("Error saving sigil:", error);
      alert("Error saving sigil");
    } else {
      alert("Sigil saved successfully!");
      fetchServitors();
      setSelectedServitor({ ...selectedServitor, sigil_image: generatedSigil });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("servitors")
      .update({
        name: editData.name,
        call: editData.call,
        purpose: editData.purpose,
        powers: editData.powers,
        timing: editData.timing,
        appearance: editData.appearance,
        sustenance: editData.sustenance,
        location: editData.location,
        fatal_flaw: editData.fatal_flaw,
        zodiac_sign: editData.zodiac_sign,
      })
      .eq("id", editData.id);

    if (error) {
      console.error("Error updating servitor:", error);
      alert("Error updating servitor");
    } else {
      alert("Servitor updated successfully!");
      setIsEditing(false);
      setSelectedServitor(null);
      setGeneratedSigil(null);
      fetchServitors();
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this servitor? This cannot be undone."
      )
    ) {
      return;
    }

    const { error } = await supabase.from("servitors").delete().eq("id", id);

    if (error) {
      console.error("Error deleting servitor:", error);
      alert("Error deleting servitor");
    } else {
      alert("Servitor deleted successfully");
      setSelectedServitor(null);
      setGeneratedSigil(null);
      fetchServitors();
    }
  };

  const downloadSigil = (sigil, name) => {
    const link = document.createElement("a");
    link.download = `${name}-sigil.png`;
    link.href = sigil;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading your servitors...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Servitors</h1>

        {servitors.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              You haven't created any servitors yet.
            </p>
            <a
              href="/servitor"
              className="inline-block bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition"
            >
              Create Your First Servitor
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servitors.map((servitor) => (
              <div
                key={servitor.id}
                onClick={() => setSelectedServitor(servitor)}
                className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-xl transition"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {servitor.name}
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  Created: {new Date(servitor.created_at).toLocaleDateString()}
                </p>
                {servitor.zodiac_sign && (
                  <p className="text-sm text-purple-600 mb-3">
                    ♈ {servitor.zodiac_sign}
                  </p>
                )}
                {servitor.sigil_image && (
                  <p className="text-sm text-green-600 mb-3">✓ Sigil created</p>
                )}
                <p className="text-gray-700 line-clamp-3">{servitor.purpose}</p>
                <p className="text-sm text-purple-600 mt-3 font-medium">
                  {servitor.timing}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* View/Edit Modal */}
        {selectedServitor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto p-8 my-8">
              {!isEditing ? (
                // View Mode
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Details */}
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-3xl font-bold text-gray-900">
                        {selectedServitor.name}
                      </h2>
                      <button
                        onClick={() => {
                          setSelectedServitor(null);
                          setGeneratedSigil(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedServitor.call && (
                        <div>
                          <strong className="text-gray-700">Call:</strong>
                          <p className="text-gray-600">
                            {selectedServitor.call}
                          </p>
                        </div>
                      )}

                      <div>
                        <strong className="text-gray-700">Purpose:</strong>
                        <p className="text-gray-600">
                          {selectedServitor.purpose}
                        </p>
                      </div>

                      {selectedServitor.powers && (
                        <div>
                          <strong className="text-gray-700">Powers:</strong>
                          <p className="text-gray-600">
                            {selectedServitor.powers}
                          </p>
                        </div>
                      )}

                      <div>
                        <strong className="text-gray-700">Timing:</strong>
                        <p className="text-gray-600">
                          {selectedServitor.timing}
                        </p>
                      </div>

                      {selectedServitor.zodiac_sign && (
                        <div>
                          <strong className="text-gray-700">
                            Zodiac Sign:
                          </strong>
                          <p className="text-gray-600">
                            {selectedServitor.zodiac_sign}
                          </p>
                        </div>
                      )}

                      {selectedServitor.appearance && (
                        <div>
                          <strong className="text-gray-700">Appearance:</strong>
                          <p className="text-gray-600">
                            {selectedServitor.appearance}
                          </p>
                        </div>
                      )}

                      {selectedServitor.sustenance && (
                        <div>
                          <strong className="text-gray-700">Sustenance:</strong>
                          <p className="text-gray-600">
                            {selectedServitor.sustenance}
                          </p>
                        </div>
                      )}

                      {selectedServitor.location && (
                        <div>
                          <strong className="text-gray-700">Location:</strong>
                          <p className="text-gray-600">
                            {selectedServitor.location}
                          </p>
                        </div>
                      )}

                      <div>
                        <strong className="text-gray-700">Fatal Flaw:</strong>
                        <p className="text-gray-600">
                          {selectedServitor.fatal_flaw}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={() => handleEdit(selectedServitor)}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(selectedServitor.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Right Column - Sigil */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Sigil
                    </h3>

                    {/* Hidden canvas for generation */}
                    <SigilGenerator
                      name={selectedServitor.name}
                      onSigilGenerated={handleSigilGenerated}
                    />

                    {/* Display existing or generated sigil */}
                    {selectedServitor.sigil_image || generatedSigil ? (
                      <div className="space-y-4">
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                          <img
                            src={selectedServitor.sigil_image || generatedSigil}
                            alt={`Sigil for ${selectedServitor.name}`}
                            className="w-full h-auto"
                          />
                        </div>

                        <div className="flex gap-2">
                          {!selectedServitor.sigil_image && generatedSigil && (
                            <button
                              onClick={handleGenerateSigil}
                              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
                            >
                              Save Sigil
                            </button>
                          )}
                          <button
                            onClick={() =>
                              downloadSigil(
                                selectedServitor.sigil_image || generatedSigil,
                                selectedServitor.name
                              )
                            }
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                          >
                            Download Sigil
                          </button>
                        </div>

                        {selectedServitor.sigil_image && (
                          <button
                            onClick={handleGenerateSigil}
                            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition"
                          >
                            Regenerate Sigil
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-8 text-center">
                        <p className="text-gray-600 mb-4">No sigil yet</p>
                        <button
                          onClick={handleGenerateSigil}
                          className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition"
                        >
                          Generate Sigil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Edit Mode
                <>
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">
                      Edit Servitor
                    </h2>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedServitor(null);
                        setGeneratedSigil(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Call
                      </label>
                      <input
                        type="text"
                        value={editData.call || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, call: e.target.value })
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
                        value={editData.purpose}
                        onChange={(e) =>
                          setEditData({ ...editData, purpose: e.target.value })
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
                        value={editData.powers || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, powers: e.target.value })
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
                        value={editData.timing}
                        onChange={(e) =>
                          setEditData({ ...editData, timing: e.target.value })
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
                        value={editData.zodiac_sign || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            zodiac_sign: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">
                          Select a zodiac sign (optional)
                        </option>
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
                        value={editData.appearance || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            appearance: e.target.value,
                          })
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
                        value={editData.sustenance || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            sustenance: e.target.value,
                          })
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
                        value={editData.location || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, location: e.target.value })
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
                        value={editData.fatal_flaw}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            fatal_flaw: e.target.value,
                          })
                        }
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
