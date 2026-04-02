/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { notifyUser } from "../../../helpers/notifyUser";
import { Spinner } from "../../../components/loaders/Spinner";
import { TrashIcon } from "../../../components/icons/general/TrashIcon";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";

export type EventType = "exam" | "lecture" | "meeting" | "social" | "deadline";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: EventType;
  description?: string;
  lumaUrl?: string; // optional Luma event link for registration
  createdAt?: any;
  updatedAt?: any;
}

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: "exam",     label: "Exam",     color: "bg-red-100 text-red-700 border-red-200"     },
  { value: "lecture",  label: "Lecture",  color: "bg-blue-100 text-blue-700 border-blue-200"  },
  { value: "meeting",  label: "Meeting",  color: "bg-amber-100 text-amber-700 border-amber-200"},
  { value: "social",   label: "Social",   color: "bg-green-100 text-green-700 border-green-200"},
  { value: "deadline", label: "Deadline", color: "bg-orange-100 text-orange-700 border-orange-200"},
];


const EMPTY_FORM = {
  title: "",
  date: "",
  time: "",
  type: "exam" as EventType,
  description: "",
  lumaUrl: "",
};

export default function AdminEventsManager() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterType, setFilterType] = useState<"all" | EventType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string; title: string }>({ show: false, id: "", title: "" });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "events"), orderBy("date", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as CalendarEvent[];
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      notifyUser("error", "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      notifyUser("error", "Title and date are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "events", editingId), {
          title: form.title.trim(),
          date: form.date,
          time: form.time.trim() || null,
          type: form.type,
          description: form.description.trim() || null,
          lumaUrl: form.lumaUrl.trim() || null,
          updatedAt: serverTimestamp(),
        });
        notifyUser("success", "Event updated successfully");
      } else {
        await addDoc(collection(db, "events"), {
          title: form.title.trim(),
          date: form.date,
          time: form.time.trim() || null,
          type: form.type,
          description: form.description.trim() || null,
          lumaUrl: form.lumaUrl.trim() || null,
          createdAt: serverTimestamp(),
        });
        notifyUser("success", "Event created successfully");
      }
      resetForm();
      fetchEvents();
    } catch (err) {
      console.error("Error saving event:", err);
      notifyUser("error", "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setForm({
      title: event.title,
      date: event.date,
      time: event.time || "",
      type: event.type,
      description: event.description || "",
      lumaUrl: event.lumaUrl || "",
    });
    setEditingId(event.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return;
    setDeletingId(confirmDelete.id);
    try {
      await deleteDoc(doc(db, "events", confirmDelete.id));
      setEvents((prev) => prev.filter((e) => e.id !== confirmDelete.id));
      notifyUser("success", "Event deleted");
    } catch (err) {
      console.error("Error deleting event:", err);
      notifyUser("error", "Failed to delete event");
    } finally {
      setDeletingId(null);
      setConfirmDelete({ show: false, id: "", title: "" });
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesType = filterType === "all" || e.type === filterType;
    const matchesSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const today = new Date().toISOString().split("T")[0];
  const upcomingCount = events.filter((e) => e.date >= today).length;
  const pastCount = events.filter((e) => e.date < today).length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-gray-500 text-sm font-medium">Total Events</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{events.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 shadow-sm p-4">
          <p className="text-green-600 text-sm font-medium">Upcoming</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{upcomingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-gray-500 text-sm font-medium">Past Events</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{pastCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4">
          <p className="text-red-600 text-sm font-medium">Exams</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{events.filter((e) => e.type === "exam").length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <motion.div
          variants={fadeInVariants5}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          custom={1}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl border-2 border-green-200 shadow-sm p-5 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? "Edit Event" : "Add New Event"}
              </h3>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Anatomy Practical Exam"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        form.type === t.value
                          ? t.color + " ring-2 ring-offset-1 ring-current"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Time <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.time}
                  onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                  placeholder="e.g. 9:00 AM"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Additional details about this event..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                />
              </div>

              {/* Luma URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Luma Event Link <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="url"
                  value={form.lumaUrl}
                  onChange={(e) => setForm((p) => ({ ...p, lumaUrl: e.target.value }))}
                  placeholder="https://lu.ma/your-event"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                />
                <p className="text-xss text-gray-400 mt-1">Students will see a Register button linking to this Luma page.</p>
              </div>

              <button
                className="w-full py-2.5 rounded-xl bg-[#00875a] text-white text-sm font-semibold hover:bg-[#00875a]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Spinner className="w-4 h-4 text-white" />
                    {editingId ? "Updating..." : "Creating..."}
                  </>
                ) : editingId ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 7H9l-7 5 7 5h11a2 2 0 002-2V9a2 2 0 00-2-2z" /><line x1="18" y1="12" x2="18" y2="12.01" />
                    </svg>
                    Update Event
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create Event
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
            >
              <option value="all">All Types</option>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="px-4 py-2 bg-[#00875a] text-white rounded-xl text-sm font-medium hover:bg-[#00875a]/90 disabled:opacity-50 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex items-center justify-center">
              <Spinner className="w-8 h-8" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
              <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-sm">
                {searchQuery || filterType !== "all" ? "No events match your filters" : "No events yet. Create one using the form."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const typeInfo = EVENT_TYPES.find((t) => t.value === event.type);
                const isPast = event.date < today;
                return (
                  <motion.div
                    key={event.id}
                    variants={fadeInVariants5}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    custom={1}
                    className={`bg-white rounded-xl border-2 shadow-sm p-4 flex items-start gap-4 transition-opacity ${
                      isPast ? "opacity-60 border-gray-100" : "border-gray-200 hover:border-green-200"
                    }`}
                  >
                    {/* Date block */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center ${isPast ? "bg-gray-100" : "bg-green-50"}`}>
                      <span className={`text-lg font-bold leading-none ${isPast ? "text-gray-400" : "text-[#00875a]"}`}>
                        {parseInt(event.date.split("-")[2], 10)}
                      </span>
                      <span className={`text-xss uppercase font-semibold leading-none mt-0.5 ${isPast ? "text-gray-400" : "text-[#00875a]"}`}>
                        {new Date(event.date + "T00:00:00").toLocaleString("default", { month: "short" })}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xss font-semibold border ${typeInfo?.color}`}>
                          {typeInfo?.label}
                        </span>
                        {isPast && (
                          <span className="px-2 py-0.5 rounded-full text-xss font-medium bg-gray-100 text-gray-400 border border-gray-200">Past</span>
                        )}
                      </div>
                      {event.time && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {event.time}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{event.description}</p>
                      )}
                      {event.lumaUrl && (
                        <a
                          href={event.lumaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xss text-[#00875a] font-semibold hover:underline mt-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Luma link set
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(event)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Edit event"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ show: true, id: event.id, title: event.title })}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete event"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">Delete Event</h3>
            <p className="text-sm text-gray-600 text-center mb-5 text-balance">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{confirmDelete.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ show: false, id: "", title: "" })}
                disabled={!!deletingId}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!!deletingId}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingId ? <Spinner className="w-4 h-4 text-white" /> : null}
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
