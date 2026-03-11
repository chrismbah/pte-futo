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
