/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useLearningResources } from "../../../../../hooks/academics/useLearningResources";
import { Spinner } from "../../../../../components/loaders/Spinner";
import fileSearch from "../../../../../assets/svg/illustrations/fileSearch.svg";
import checkResources from "../../../../../assets/svg/illustrations/search-files.svg";
import { FileCard } from "./FileCard";
import { db, isFirebaseConfigured } from "../../../../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { trackActivity } from "../../../../../hooks/analytics/useAnalytics";

interface AdminMaterial {
  id: string;
  courseCode: string;
  courseTitle?: string;
  level: string;
  semester: string;
  resourceType: string;
}

interface CourseData {
  courseCode: string;
  courseTitle: string;
}

export default function LearningResources() {
  const [section, setSection] = useState<"preclinical" | "clinical">("preclinical");
  const [semester, setSemester] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [course, setCourse] = useState<string | null>(null);
  const [resourcesType, setResourcesType] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<CourseData[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const { getLearningResources, files, gettingResources, error } =
    useLearningResources();

  // Fetch available courses from Firestore when level and semester change
  useEffect(() => {
    const fetchCourses = async () => {
      if (!level || !semester || !isFirebaseConfigured) {
        setAvailableCourses([]);
        return;
      }

      setLoadingCourses(true);
      try {
        const q = query(
          collection(db, "learningMaterials"),
          where("level", "==", level),
          where("semester", "==", semester)
        );
        const snapshot = await getDocs(q);
        const materials = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdminMaterial[];

        // Extract unique courses
        const uniqueCourses = new Map<string, CourseData>();
        materials.forEach(material => {
          if (!uniqueCourses.has(material.courseCode)) {
            uniqueCourses.set(material.courseCode, {
              courseCode: material.courseCode,
              courseTitle: material.courseTitle || material.courseCode,
            });
          }
        });

        setAvailableCourses(Array.from(uniqueCourses.values()));
        setCourse(null); // Reset course selection
      } catch (error) {
        console.error("Error fetching courses:", error);
        setAvailableCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [level, semester]);

  // Update level when section changes
  useEffect(() => {
    setLevel(null);
    setSemester(null);
    setCourse(null);
    setResourcesType(null);
  }, [section]);

  // Track page visit on mount
  useEffect(() => {
    trackActivity("page_visit", "Learning Resources");
  }, []);

  useEffect(() => {
    if (level && course && resourcesType) {
      getLearningResources(level, course, resourcesType);
      trackActivity("resource_view", `${course} ${resourcesType} (${level}L)`);
    }
  }, [resourcesType, course]);

  // Preclinical levels (100-300)
  const preclinicalLevels = [
    { value: "100", label: "100L (Year 1)" },
    { value: "200", label: "200L (Year 2)" },
    { value: "300", label: "300L (Year 3)" },
  ];

  // Clinical levels (400-600) — 3rd MBBS=400L, 4th MBBS=500L, 5th MBBS=600L
  const clinicalLevels = [
    { value: "400", label: "400L (3rd MBBS)" },
    { value: "500", label: "500L (4th MBBS)" },
    { value: "600", label: "600L (5th MBBS)" },
  ];

  const currentLevels = section === "preclinical" ? preclinicalLevels : clinicalLevels;

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="box-width">
        <div className="py-20 sm:py-24">
          <div className="w-full flex items-center justify-center mb-6 flex-col px-3 ss:px-8 sm:px-14">
            <div className="mb-4">
              <h1 className="text-md sm:text-xll md:text-2xl font-semibold uppercase text-gray-900 text-center">
                Learning Resources
              </h1>
              <p className="section-p text-center">
                Select your section, level, semester and course
              </p>
            </div>

            {/* Google Drive Quick Access — replaces old 2 drive links */}
            <div className="w-full mb-6">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-5 rounded-full bg-green1 inline-block" />
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Quick Drive Access</h2>
              </div>

              {/* Full Library Hero Card */}
              <a
                href="https://drive.google.com/drive/folders/1C3IdOlXofYJcUXuVRD8FHsLcPBjSTlEj"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 w-full bg-gradient-to-r from-green1 to-green2 rounded-2xl p-5 mb-3 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Decorative circles */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute right-10 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 z-10">
                  <p className="text-white font-extrabold text-sm sm:text-base leading-tight">Access All Textbooks</p>
                  <p className="text-white/75 text-xs mt-0.5">Complete EBSUMSA textbook library — all levels</p>
                </div>
                <div className="z-10 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>

              {/* Level Drive Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  {
                    label: "100 Level Drive",
                    sub: "Preclinical — Year 1",
                    url: "https://drive.google.com/drive/folders/12sgN__NCu-cnuckQ4AkdLLL5xByVtuna",
                    color: "from-violet-500/10 to-purple-500/10",
                    border: "border-violet-200",
                    icon: "text-violet-600",
                  },
                  {
                    label: "200 Level Drive",
                    sub: "Preclinical — Year 2",
                    url: "https://drive.google.com/drive/folders/1-JZRq-aFQzkN04ViATbH2vbCt_qgTUQg",
                    color: "from-pink-500/10 to-rose-500/10",
                    border: "border-pink-200",
                    icon: "text-pink-600",
                  },
                  {
                    label: "2nd MBBS Drive",
                    sub: "Preclinical — 300 Level",
                    url: "https://drive.google.com/drive/folders/1v-AHH-EopfBnHmh22MSENV9IHhcHPal7",
                    color: "from-orange-500/10 to-amber-500/10",
                    border: "border-orange-200",
                    icon: "text-orange-600",
                  },
                  {
                    label: "3rd MBBS Drive",
                    sub: "Clinical — 400 Level",
                    url: "https://drive.google.com/drive/folders/1-WYCxRzrAJOL3a935HlMTqwh8TvJUwko",
                    color: "from-emerald-500/10 to-green-500/10",
                    border: "border-emerald-200",
                    icon: "text-emerald-600",
                  },
                  {
                    label: "4th MBBS Drive",
                    sub: "Clinical — 500 Level",
                    url: "https://drive.google.com/drive/folders/1-lhThxDEKOEbHot0iFF5uNCJeCXjJG3j",
                    color: "from-teal-500/10 to-cyan-500/10",
                    border: "border-teal-200",
                    icon: "text-teal-600",
                  },
                  {
                    label: "5th MBBS Drive",
                    sub: "Clinical — 600 Level",
                    url: "https://drive.google.com/drive/folders/1ONfXdUAIanILOqPWgqi2tYZK68oG70hi",
                    color: "from-blue-500/10 to-indigo-500/10",
                    border: "border-blue-200",
                    icon: "text-blue-600",
                  },
                ].map((drive) => (
                  <a
                    key={drive.label}
                    href={drive.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-3 bg-gradient-to-br ${drive.color} border ${drive.border} rounded-xl p-3.5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0`}>
                      <svg className={`w-4 h-4 ${drive.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-xs sm:text-sm leading-tight">{drive.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{drive.sub}</p>
                    </div>
                    <svg className={`w-3.5 h-3.5 text-gray-400 group-hover:${drive.icon} transition-colors flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Section Toggle (Preclinical / Clinical) */}
            <div className="flex gap-2 mb-4 bg-white rounded-lg p-1 shadow">
              <button
                onClick={() => setSection("preclinical")}
                className={`px-4 py-2 rounded-lg text-xss xss:text-ss ss:text-sm font-medium transition-colors ${
                  section === "preclinical"
                    ? "bg-green1 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Preclinical (Year 1-3)
              </button>
              <button
                onClick={() => setSection("clinical")}
                className={`px-4 py-2 rounded-lg text-xss xss:text-ss ss:text-sm font-medium transition-colors ${
                  section === "clinical"
                    ? "bg-green1 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Clinical (Year 4-6)
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-1 ss:gap-3 mb-4">
              {/* Level Select */}
              <div>
                <select
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setCourse(null);
                  }}
                  value={level || ""}
                  className="bg-white cursor-pointer border-none shadow text-gray-900 text-xss xss:text-ss ss:text-sm font-medium rounded-lg border border-transparent focus:ring-green1 focus:border-gray-500 block w-full p-1.5 sm:p-2"
                >
                  <option value="" disabled>
                    Select Level
                  </option>
                  {currentLevels.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester Select */}
              <div>
                <select
                  onChange={(e) => {
                    setSemester(e.target.value);
                    setCourse(null);
                  }}
                  value={semester || ""}
                  className="bg-white cursor-pointer border-none shadow text-gray-900 text-xss xss:text-ss ss:text-sm font-medium rounded-lg border border-transparent focus:ring-green1 focus:border-gray-500 block w-full p-1.5 sm:p-2"
                >
                  <option value="" disabled>
                    Select Semester
                  </option>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>

              {/* Course Select */}
              <div>
                <select
                  onChange={(e) => setCourse(e.target.value)}
                  value={course || ""}
                  disabled={!level || !semester || loadingCourses}
                  className="bg-white cursor-pointer border-none shadow text-gray-900 text-xss xss:text-ss ss:text-sm font-medium rounded-lg border border-transparent focus:ring-green1 focus:border-gray-500 block w-full p-1.5 sm:p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {loadingCourses ? "Loading..." : availableCourses.length === 0 && level && semester ? "No courses available" : "Select Course"}
                  </option>
                  {availableCourses.map((courseItem) => (
                    <option key={courseItem.courseCode} value={courseItem.courseCode}>
                      {courseItem.courseCode} - {courseItem.courseTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resource Type Buttons */}
            <div className="flex items-center justify-center flex-wrap xxss:flex-nowrap gap-1 xss:gap-3 relative">
              <button
                onClick={() => setResourcesType("handouts")}
                className={`${
                  resourcesType === "handouts"
                    ? "bg-green1 text-white"
                    : "bg-white shadow"
                } p-2 text-gray-900 text-xss xss:text-ss ss:text-sm rounded-md font-medium hover:bg-green1 hover:text-white transition duration-100`}
              >
                Handouts
              </button>
              <button
                onClick={() => setResourcesType("textbooks")}
                className={`${
                  resourcesType === "textbooks"
                    ? "bg-green1 text-white"
                    : "bg-white shadow"
                } p-2 text-gray-900 text-xss xss:text-ss ss:text-sm rounded-md font-medium hover:bg-green1 hover:text-white transition duration-100`}
              >
                Textbooks
              </button>
              <button
                onClick={() => setResourcesType("pastquestions")}
                className={`${
                  resourcesType === "pastquestions"
                    ? "bg-green1 text-white"
                    : "bg-white shadow"
                } p-2 text-gray-900 text-xss xss:text-ss ss:text-sm rounded-md font-medium hover:bg-green1 hover:text-white transition duration-100`}
              >
                Past Questions
              </button>
            </div>

            {/* Current Selection Info */}
            {(level || semester || course) && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Selected: </span>
                  {section === "preclinical" ? "Preclinical" : "Clinical"}
                  {level && ` / ${level}L`}
                  {semester && ` / ${semester} Semester`}
                  {course && ` / ${course}`}
                </p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="mt-5 px-2 ss:px-4 w-full flex items-center justify-center">
            {files.length === 0 && !gettingResources && (!resourcesType || !course) ? (
              <div className="flex items-center justify-center flex-col gap-3">
                <img
                  src={checkResources}
                  alt="Check out your learning resources"
                  className="w-[70%] xss:w-[200px] sm:w-[230px]"
                />
                <p className="text-sm ss:text-xs text-gray-700 font-medium text-center">
                  Select a level, semester, course and resource type to get learning resources.
                </p>
              </div>
            ) : gettingResources ? (
              <div className="mt-10 flex items-center justify-center">
                <Spinner className="fill-green1 w-8" />
              </div>
            ) : error && files.length === 0 && !gettingResources ? (
              <div className="flex items-center justify-center flex-col mt-3">
                <p className="text-sm ss:text-xs text-gray-700 font-medium text-center">
                  Oops, something went wrong. Please try again.
                </p>
              </div>
            ) : files.length === 0 && course && level && resourcesType ? (
              <div className="flex items-center justify-center flex-col">
                <img
                  src={fileSearch}
                  alt="File not available"
                  className="w-full ss:w-[400px]"
                />
                <p className="text-sm ss:text-xs text-gray-700 font-medium text-center">
                  Sorry, {course}{" "}
                  {resourcesType === "textbooks"
                    ? "Textbooks"
                    : resourcesType === "pastquestions"
                    ? "Past Questions"
                    : "Handouts"}{" "}
                  are not available yet.
                </p>
              </div>
            ) : (
              files.length > 0 && (
                <div className="grid items-center w-full ss:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 px-0 xxss:px-6 ss:px-4 max-w-[1200px] xl:w-[1200px]">
                  {files.map((info, i) => (
                    <FileCard key={i} {...info} />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
