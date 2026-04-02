import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../animation/variants";
import placeholder from "../../assets/img/team/placeholder.png";
import { GeneralNavbar } from "../../components/navbar/GeneralNavbar";
import Footer from "../../components/footer/Footer";
import { supabase } from "../../config/supabase";

export interface AlumniMember {
  id: string;
  fullName: string;
  role: string;
  yearServed: string;
  imageUrl?: string;
  bio?: string;
}

// ─── Static fallback data (shown until Supabase data loads) ─────────────────
const staticAlumniData: AlumniMember[] = [
  {
    id: "1",
    fullName: "Alumni Member",
    role: "President",
    yearServed: "2025/2026",
    imageUrl: "/img/alumni/IMG-20260309-WA0048.jpg",
    bio: "",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

function AlumniCard({ member, index }: { member: AlumniMember; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={fadeInVariants5}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      custom={index}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green2 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
          <img
            src={member.imageUrl || placeholder}
            alt={member.fullName}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholder;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate">
            {member.fullName}
          </h3>
          <p className="text-xs sm:text-sm text-green2 font-semibold mt-0.5 truncate">
            {member.role}
          </p>
          <span className="inline-block mt-1.5 px-2 py-0.5 bg-green2/10 text-green2 text-xss font-semibold rounded-full">
            {member.yearServed} Administration
          </span>
        </div>

        {member.bio && (
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse bio" : "View bio"}
            className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 hover:border-green2 hover:bg-green2/5 flex items-center justify-center transition-colors"
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {member.bio && expanded && (
        <div className="px-4 sm:px-5 pb-4 pt-0 border-t border-gray-100">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-3">
            {member.bio}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function AlumniPage() {
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [alumniData, setAlumniData] = useState<AlumniMember[]>(staticAlumniData);
  const [loadingAlumni, setLoadingAlumni] = useState(true);

  useEffect(() => {
    supabase
      .from("alumni")
      .select("id, full_name, role, year_served, image_url, bio")
      .order("year_served", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setAlumniData(
            data.map((row) => ({
              id: row.id,
              fullName: row.full_name,
              role: row.role,
              yearServed: row.year_served,
              imageUrl: row.image_url ?? undefined,
              bio: row.bio ?? undefined,
            }))
          );
        }
        setLoadingAlumni(false);
      });
  }, []);

  const years = [
    "all",
    ...Array.from(new Set(alumniData.map((a) => a.yearServed))).sort((a, b) =>
      b.localeCompare(a)
    ),
  ];

  const filtered = alumniData.filter((a) => {
    const matchSearch =
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase());
    const matchYear = selectedYear === "all" || a.yearServed === selectedYear;
    return matchSearch && matchYear;
  });

  const grouped: Record<string, AlumniMember[]> = {};
  filtered.forEach((a) => {
    if (!grouped[a.yearServed]) grouped[a.yearServed] = [];
    grouped[a.yearServed].push(a);
  });
  const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-gray-50">
      <GeneralNavbar />

      {/* Hero */}
      <section className="pt-[80px] ss:pt-[90px] sm:pt-[105px] bg-green2">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <motion.p
            variants={fadeInVariants5}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={1}
            className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2"
          >
            EBSUMSA
          </motion.p>
          <motion.h1
            variants={fadeInVariants5}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={2}
            className="text-3xl sm:text-4xl font-bold text-white mb-3 text-balance"
          >
            Alumni Hall of Service
          </motion.h1>
          <motion.p
            variants={fadeInVariants5}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={3}
            className="text-white/75 text-sm sm:text-base max-w-2xl leading-relaxed"
          >
            Honouring past EBSUMSA executives who dedicated their time and
            leadership to advance the medical student community at EBSU.
          </motion.p>
        </div>

        <svg
          className="w-full block"
          viewBox="0 0 1440 48"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="#f9fafb" />
        </svg>
      </section>

      {/* Filters */}
      {alumniData.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green2/30 focus:border-green2 transition-colors"
              />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green2/30 focus:border-green2 transition-colors"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === "all" ? "All Administrations" : `${y} Administration`}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 pb-20">
        {loadingAlumni ? (
          <div className="flex items-center justify-center py-24">
            <svg className="w-8 h-8 animate-spin text-green2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : alumniData.length === 0 ? (
          <div className="text-center py-24 bg-white border border-gray-200 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No alumni added yet</h3>
            <p className="text-sm text-gray-400">Alumni will appear here once added to the data file.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500">No alumni match your search.</p>
          </div>
        ) : (
          sortedYears.map((year) => (
            <div key={year} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                  {year} Administration
                </span>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                  {grouped[year].length} {grouped[year].length === 1 ? "member" : "members"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grouped[year].map((member, i) => (
                  <AlumniCard key={member.id} member={member} index={i + 1} />
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}
