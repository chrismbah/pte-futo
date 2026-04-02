import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";
import { db } from "../../../config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import type { CalendarEvent, EventType } from "../../admin/tabs/AdminEventsManager";

const EVENT_COLORS: Record<EventType, { bg: string; border: string; text: string; badge: string; badgeText: string; dot: string }> = {
  exam:     { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-800",    badge: "bg-red-100",    badgeText: "text-red-700",    dot: "bg-red-500"    },
  lecture:  { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-800",   badge: "bg-blue-100",   badgeText: "text-blue-700",   dot: "bg-blue-500"   },
  meeting:  { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-800",  badge: "bg-amber-100",  badgeText: "text-amber-700",  dot: "bg-amber-500"  },
  social:   { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-800",  badge: "bg-green-100",  badgeText: "text-green-700",  dot: "bg-green-500"  },
  deadline: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", badge: "bg-orange-100", badgeText: "text-orange-700", dot: "bg-orange-500" },
};

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const EVENT_TYPE_OPTIONS: { value: "all" | EventType; label: string }[] = [
  { value: "all",      label: "All Events" },
  { value: "exam",     label: "Exams"      },
  { value: "lecture",  label: "Lectures"   },
  { value: "meeting",  label: "Meetings"   },
  { value: "social",   label: "Social"     },
  { value: "deadline", label: "Deadlines"  },
];

export default function EventsPage() {
  const today = new Date().toISOString().split("T")[0];

  const [events, setEvents]       = useState<CalendarEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"upcoming" | "past" | "all">("upcoming");
  const [typeFilter, setTypeFilter] = useState<"all" | EventType>("all");
  const [search, setSearch]       = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const snapshot = await getDocs(q);
        setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as CalendarEvent[]);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = events.filter((e) => {
    if (filter === "upcoming" && e.date < today) return false;
    if (filter === "past"     && e.date >= today) return false;
    if (typeFilter !== "all"  && e.type !== typeFilter) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
        !(e.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const upcomingCount = events.filter((e) => e.date >= today).length;

  const getDaysUntil = (dateStr: string) => {
    const diff = Math.ceil(
      (new Date(dateStr + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000
    );
    if (diff === 0)  return "Today";
    if (diff === 1)  return "Tomorrow";
    if (diff < 0)    return `${Math.abs(diff)}d ago`;
    return `In ${diff} day${diff === 1 ? "" : "s"}`;
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return { day: d, month: MONTHS[m - 1], year: y };
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeInVariants5}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={1}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {upcomingCount > 0
                ? `${upcomingCount} upcoming event${upcomingCount === 1 ? "" : "s"}`
                : "No upcoming events"}
            </p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {(["upcoming", "all", "past"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${
                filter === f
                  ? "bg-[#00875a] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="w-px h-5 bg-gray-200 hidden sm:block" />
          {EVENT_TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                typeFilter === t.value
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Events list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="w-8 h-8 text-[#00875a] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p className="text-gray-500 text-sm font-medium">No events found</p>
          <p className="text-gray-400 text-xs">Try changing the filter or check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((event, i) => {
            const color   = EVENT_COLORS[event.type];
            const isPast  = event.date < today;
            const { day, month, year } = formatDate(event.date);

            return (
              <motion.div
                key={event.id}
                variants={fadeInVariants5}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                custom={i + 2}
                className={`flex items-start gap-3 sm:gap-4 rounded-2xl border-2 p-3 sm:p-4 transition-opacity ${
                  isPast
                    ? "opacity-60 bg-gray-50 border-gray-100"
                    : `${color.bg} ${color.border}`
                }`}
              >
                {/* Date block */}
                <div className={`flex-shrink-0 w-12 sm:w-14 rounded-xl flex flex-col items-center justify-center py-2 text-center ${
                  isPast ? "bg-gray-200" : "bg-white/70"
                }`}>
                  <span className={`text-lg sm:text-xl font-bold leading-none ${isPast ? "text-gray-400" : color.text}`}>
                    {day}
                  </span>
                  <span className={`text-xss sm:text-xs uppercase font-semibold leading-none mt-0.5 ${isPast ? "text-gray-400" : color.text}`}>
                    {month}
                  </span>
                  <span className="text-sss text-gray-400 mt-0.5">{year}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className={`text-sm sm:text-base font-bold ${isPast ? "text-gray-500" : "text-gray-900"}`}>
                      {event.title}
                    </h3>
                    <span className={`text-xss font-semibold px-2 py-0.5 rounded-full capitalize ${color.badge} ${color.badgeText}`}>
                      {event.type}
                    </span>
                    {isPast && (
                      <span className="text-xss font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
                        Past
                      </span>
                    )}
                  </div>

                  {event.time && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {event.time}
                    </p>
                  )}

                  {event.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{event.description}</p>
                  )}

                  {!isPast && (
                    <p className={`text-xss sm:text-xs font-semibold mt-1.5 ${color.text}`}>
                      {getDaysUntil(event.date)}
                    </p>
                  )}
                </div>

                {/* Register button */}
                {event.lumaUrl && !isPast && (
                  <a
                    href={event.lumaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#00875a] hover:bg-[#006644] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    Register
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
