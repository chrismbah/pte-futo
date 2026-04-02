/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Spinner } from "../../../components/loaders/Spinner";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";
interface Material {
  id: string;
  title: string;
  description: string;
  resourceType: string; // handouts, textbooks, pastquestions
  category?: string; // legacy field
  level: string;
  semester?: string;
  courseCode?: string;
  courseTitle?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadedBy: string;
  createdAt: any;
}

export default function ResourcesPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, selectedCategory, selectedLevel, searchTerm]);

  const fetchMaterials = async () => {
    try {
      const q = query(
        collection(db, "learningMaterials"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const materialsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Material[];
      setMaterials(materialsData);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    if (selectedCategory !== "all") {
      // Check both resourceType (new) and category (legacy)
      filtered = filtered.filter((m) => 
        m.resourceType === selectedCategory || m.category === selectedCategory
      );
    }

    if (selectedLevel !== "all") {
      // Handle both "100" and "100L" formats
      const levelNumber = selectedLevel.replace("L", "");
      filtered = filtered.filter(
        (m) => m.level === selectedLevel || m.level === levelNumber || m.level === "all"
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMaterials(filtered);
  };

  const getCategoryLabel = (resourceType: string) => {
    const labels: { [key: string]: string } = {
      textbooks: "Textbooks",
      books: "Books",
      handouts: "Handouts",
      pastquestions: "Past Questions",
      pastQuestions: "Past Questions",
      notes: "Lecture Notes",
      others: "Others",
    };
    return labels[resourceType] || resourceType;
  };

  const getCategoryIcon = (resourceType: string) => {
    switch (resourceType) {
      case "textbooks":
      case "books":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case "handouts":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "pastquestions":
      case "pastQuestions":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "notes":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white min-h-screen pt-[80px] ss:pt-[90px] sm:pt-[105px] pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          variants={fadeInVariants5}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          custom={1}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Learning Resources
          </h1>
          <p className="text-gray-600">
            Access books, handouts, past questions, and lecture notes uploaded
            by admin.
          </p>
        </motion.div>

        {/* ── Textbook Drive Hero Banner ───────────────────────────────────── */}
        <motion.div
          variants={fadeInVariants5}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          custom={2}
          className="mb-6"
        >
          <a
            href="https://drive.google.com/drive/folders/1C3IdOlXofYJcUXuVRD8FHsLcPBjSTlEj"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full bg-gradient-to-r from-green1 to-green2 rounded-2xl p-5 sm:p-6 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Decorative circles */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/10 pointer-events-none hidden sm:block" />
            <div className="absolute right-16 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/10 pointer-events-none hidden sm:block" />

            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>

            <div className="flex-1 min-w-0 z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                  All Levels
                </span>
              </div>
              <p className="text-white font-extrabold text-lg sm:text-xl leading-tight">Access All Textbooks</p>
              <p className="text-white/80 text-sm mt-1">
                Browse the complete EBSUMSA textbook library — every year, every course, all in one place.
              </p>
            </div>

            <div className="z-10 flex items-center gap-2 mt-2 sm:mt-0 px-4 py-2.5 bg-white text-green1 font-bold text-sm rounded-xl shadow group-hover:shadow-md transition-all flex-shrink-0">
              Open Drive
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>

          {/* Level Drives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {[
              { label: "100 Level Drive", sub: "Preclinical — Year 1", url: "https://drive.google.com/drive/folders/12sgN__NCu-cnuckQ4AkdLLL5xByVtuna", from: "from-violet-50", border: "border-violet-200 hover:border-violet-400", iconBg: "bg-violet-100", icon: "text-violet-600" },
              { label: "200 Level Drive", sub: "Preclinical — Year 2", url: "https://drive.google.com/drive/folders/1-JZRq-aFQzkN04ViATbH2vbCt_qgTUQg", from: "from-pink-50", border: "border-pink-200 hover:border-pink-400", iconBg: "bg-pink-100", icon: "text-pink-600" },
              { label: "2nd MBBS Drive", sub: "Preclinical — 300 Level", url: "https://drive.google.com/drive/folders/1v-AHH-EopfBnHmh22MSENV9IHhcHPal7", from: "from-orange-50", border: "border-orange-200 hover:border-orange-400", iconBg: "bg-orange-100", icon: "text-orange-600" },
              { label: "3rd MBBS Drive", sub: "Clinical — 400 Level", url: "https://drive.google.com/drive/folders/1-WYCxRzrAJOL3a935HlMTqwh8TvJUwko", from: "from-emerald-50", border: "border-emerald-200 hover:border-emerald-400", iconBg: "bg-emerald-100", icon: "text-emerald-600" },
              { label: "4th MBBS Drive", sub: "Clinical — 500 Level", url: "https://drive.google.com/drive/folders/1-lhThxDEKOEbHot0iFF5uNCJeCXjJG3j", from: "from-teal-50", border: "border-teal-200 hover:border-teal-400", iconBg: "bg-teal-100", icon: "text-teal-600" },
              { label: "5th MBBS Drive", sub: "Clinical — 600 Level", url: "https://drive.google.com/drive/folders/1ONfXdUAIanILOqPWgqi2tYZK68oG70hi", from: "from-blue-50", border: "border-blue-200 hover:border-blue-400", iconBg: "bg-blue-100", icon: "text-blue-600" },
            ].map((drive, i) => (
              <motion.a
                key={drive.label}
                href={drive.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeInVariants5}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                custom={i + 3}
                className={`group flex items-center gap-3 bg-gradient-to-br ${drive.from} to-white border ${drive.border} rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
              >
                <div className={`w-10 h-10 rounded-xl ${drive.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-5 h-5 ${drive.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight">{drive.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{drive.sub}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-300 group-hover:${drive.icon} transition-colors flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={fadeInVariants5}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          custom={3}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Categories</option>
                <option value="textbooks">Textbooks</option>
                <option value="handouts">Handouts</option>
                <option value="pastquestions">Past Questions</option>
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green2 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Levels</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
                <option value="600">600 Level</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Materials Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="w-10 h-10" />
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg">No materials found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                variants={fadeInVariants5}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                custom={index + 5}
                className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green2/10 text-green2 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getCategoryIcon(material.resourceType || material.category || "")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      {material.title}
                    </h3>
                    {material.courseCode && (
                      <p className="text-xs text-green2 font-medium mt-0.5">
                        {material.courseCode}{material.courseTitle ? ` - ${material.courseTitle}` : ""}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {material.description || "No description available"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {getCategoryLabel(material.resourceType || material.category || "")}
                      </span>
                      <span className="px-2 py-1 bg-green2/10 text-green2 rounded text-xs">
                        {material.level === "all"
                          ? "All Levels"
                          : `${material.level}L`}
                      </span>
                      {material.semester && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                          {material.semester} Sem
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-green2 hover:bg-green1 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
