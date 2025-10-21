"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

function RitualLogsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const servitorIdFromUrl = searchParams.get("servitor");

  const [ritualLogs, setRitualLogs] = useState([]);
  const [servitors, setServitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterServitor, setFilterServitor] = useState(
    servitorIdFromUrl || "all"
  );

  const [formData, setFormData] = useState({
    servitor_id: servitorIdFromUrl || "",
    ritual_date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0],
    title: "",
    notes: "",
    experiences: "",
    insights: "",
  });

  useEffect(() => {
    if (user) {
      fetchServitors();
      fetchRitualLogs();
    }
  }, [user]);

  useEffect(() => {
    if (servitorIdFromUrl && servitors.length > 0) {
      setFilterServitor(servitorIdFromUrl);
      setFormData((prev) => ({ ...prev, servitor_id: servitorIdFromUrl }));
    }
  }, [servitorIdFromUrl, servitors]);

  const fetchServitors = async () => {
    const { data, error } = await supabase
      .from("servitors")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error("Error fetching servitors:", error);
    } else {
      setServitors(data);
    }
  };

  const fetchRitualLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ritual_logs")
      .select(
        `
        *,
        servitors (name)
      `
      )
      .eq("user_id", user.id)
      .order("ritual_date", { ascending: false });

    if (error) {
      console.error("Error fetching ritual logs:", error);
    } else {
      setRitualLogs(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToInsert = {
      user_id: user.id,
      servitor_id: formData.servitor_id || null,
      ritual_date: formData.ritual_date,
      title: formData.title || null,
      notes: formData.notes,
      experiences: formData.experiences || null,
      insights: formData.insights || null,
    };

    if (selectedLog) {
      // Update existing log
      const { error } = await supabase
        .from("ritual_logs")
        .update(dataToInsert)
        .eq("id", selectedLog.id);

      if (error) {
        console.error("Error updating ritual log:", error);
        alert("Error updating ritual log");
      } else {
        alert("Ritual log updated successfully!");
        resetForm();
        fetchRitualLogs();
      }
    } else {
      // Create new log
      const { error } = await supabase
        .from("ritual_logs")
        .insert([dataToInsert]);

      if (error) {
        console.error("Error creating ritual log:", error);
        alert("Error creating ritual log");
      } else {
        alert("Ritual log created successfully!");
        resetForm();
        fetchRitualLogs();
      }
    }
  };

  const handleEdit = (log) => {
    setSelectedLog(log);
    setFormData({
      servitor_id: log.servitor_id || "",
      ritual_date: log.ritual_date,
      title: log.title || "",
      notes: log.notes || "",
      experiences: log.experiences || "",
      insights: log.insights || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this ritual log?")) {
      return;
    }

    const { error } = await supabase.from("ritual_logs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting ritual log:", error);
      alert("Error deleting ritual log");
    } else {
      alert("Ritual log deleted successfully");
      fetchRitualLogs();
    }
  };

  const resetForm = () => {
    setFormData({
      servitor_id: servitorIdFromUrl || "",
      ritual_date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0],
      title: "",
      notes: "",
      experiences: "",
      insights: "",
    });
    setSelectedLog(null);
    setShowForm(false);
  };

  const filteredLogs =
    filterServitor === "all"
      ? ritualLogs
      : ritualLogs.filter((log) => log.servitor_id === filterServitor);

  const getServitorName = (servitorId) => {
    const servitor = servitors.find((s) => s.id === servitorId);
    return servitor ? servitor.name : "General Practice";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading ritual logs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Ritual Logs</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition"
          >
            {showForm ? "Cancel" : "+ Log New Ritual"}
          </button>
        </div>

        {/* Filter by Servitor */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Servitor
          </label>
          <select
            value={filterServitor}
            onChange={(e) => setFilterServitor(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border text-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Servitors</option>
            <option value="">General Practice (No Servitor)</option>
            {servitors.map((servitor) => (
              <option key={servitor.id} value={servitor.id}>
                {servitor.name}
              </option>
            ))}
          </select>
        </div>

        {/* New/Edit Ritual Form */}
        {showForm && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedLog ? "Edit Ritual Log" : "New Ritual Log"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servitor (Optional)
                </label>
                <select
                  value={formData.servitor_id}
                  onChange={(e) =>
                    setFormData({ ...formData, servitor_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">General Practice (No Servitor)</option>
                  {servitors.map((servitor) => (
                    <option key={servitor.id} value={servitor.id}>
                      {servitor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ritual Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.ritual_date}
                  max={
                    new Date(
                      Date.now() - new Date().getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, ritual_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Morning Invocation, Evening Work"
                  className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ritual Notes *
                </label>
                <textarea
                  required
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows="4"
                  placeholder="What happened during the ritual? What did you do?"
                  className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiences (Optional)
                </label>
                <textarea
                  value={formData.experiences}
                  onChange={(e) =>
                    setFormData({ ...formData, experiences: e.target.value })
                  }
                  rows="3"
                  placeholder="What did you experience? Sensations, visions, emotions, responses from the servitor?"
                  className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insights (Optional)
                </label>
                <textarea
                  value={formData.insights}
                  onChange={(e) =>
                    setFormData({ ...formData, insights: e.target.value })
                  }
                  rows="3"
                  placeholder="What did you learn? Any realizations or patterns noticed?"
                  className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
                >
                  {selectedLog ? "Update Log" : "Save Log"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ritual Logs Timeline */}
        {filteredLogs.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              {filterServitor === "all"
                ? "You haven't logged any rituals yet."
                : "No rituals logged for this servitor yet."}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-block bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition"
            >
              Log Your First Ritual
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {log.title || "Ritual Entry"}
                      </h3>
                      {log.servitor_id && (
                        <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                          {log.servitors?.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(log.ritual_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(log)}
                      className="text-purple-600 hover:text-purple-700 px-3 py-1 rounded-md border border-purple-600 hover:bg-purple-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-red-600 hover:text-red-700 px-3 py-1 rounded-md border border-red-600 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <strong className="text-gray-700 text-sm">Notes:</strong>
                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                      {log.notes}
                    </p>
                  </div>

                  {log.experiences && (
                    <div>
                      <strong className="text-gray-700 text-sm">
                        Experiences:
                      </strong>
                      <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                        {log.experiences}
                      </p>
                    </div>
                  )}

                  {log.insights && (
                    <div>
                      <strong className="text-gray-700 text-sm">
                        Insights:
                      </strong>
                      <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                        {log.insights}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RitualLogs() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-xl text-gray-600">Loading ritual logs...</p>
        </div>
      }
    >
      <RitualLogsContent />
    </Suspense>
  );
}
