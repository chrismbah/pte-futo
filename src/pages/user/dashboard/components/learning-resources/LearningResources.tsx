/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useLearningResources } from "../../../../../hooks/academics/useLearningResources";
import { Spinner } from "../../../../../components/loaders/Spinner";
import fileSearch from "../../../../../assets/svg/illustrations/fileSearch.svg";
import checkResources from "../../../../../assets/svg/illustrations/search-files.svg";
import { FileCard } from "./FileCard";
import { db, isFirebaseConfigured } from "../../../../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

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

  useEffect(() => {
    if (level && course && resourcesType) {
      getLearningResources(level, course, resourcesType);
    }
  }, [resourcesType, course]);

  // Preclinical levels (100-300)
  const preclinicalLevels = [
    { value: "100", label: "100L (Year 1)" },
    { value: "200", label: "200L (Year 2)" },
    { value: "300", label: "300L (Year 3)" },
  ];

  // Clinical levels (400-600)
  const clinicalLevels = [
    { value: "400", label: "400L (Year 4)" },
    { value: "500", label: "500L (Year 5)" },
    { value: "600", label: "600L (Year 6)" },
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
