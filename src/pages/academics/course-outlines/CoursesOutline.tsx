import { useEffect, useState } from "react";
import { useCourseOutlineContext } from "../../../context/CourseOutline";
import { CourseOutlineCard } from "./CoursesOutlineCard";
import { useParams } from "react-router-dom";
import Footer from "../../../components/footer/Footer";
import { motion } from "framer-motion";
import { fadeInVariants1 } from "../../../animation/variants";
import { db } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Spinner } from "../../../components/loaders/Spinner";

interface CourseOutlineEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  creditUnits: string;
  preRequisite: string | null;
  level: string;
  semester: "First" | "Second";
  info: { heading: string; content: string }[];
  option?: string;
}

export default function CoursesOutline() {
  const { level } = useParams();
  const { semester, setSemester } = useCourseOutlineContext();
  const [firestoreOutlines, setFirestoreOutlines] = useState<CourseOutlineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch outlines from Firestore
  useEffect(() => {
    const fetchOutlines = async () => {
      try {
        const snapshot = await getDocs(collection(db, "courseOutlines"));
        const outlines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CourseOutlineEntry[];
        setFirestoreOutlines(outlines);
      } catch (error) {
        console.error("Error fetching course outlines:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOutlines();
  }, []);

  // Get Firestore outlines for the current level and semester (only show admin-created outlines)
  const getOutlinesForLevel = () => {
    return firestoreOutlines
      .filter((o) => o.level === level && o.semester === semester)
      .map((o) => ({
        id: o.id,
        courseCode: o.courseCode,
        courseTitle: o.courseTitle,
        creditUnit: o.creditUnit,
        option: o.option || "MANDATORY",
      }));
  };

  const outlines = getOutlinesForLevel();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="box-width">
        <div className="course-outline-section">
          <div className="w-full flex items-center justify-center mb-6 flex-col">
            <h2 className=" text-center font-bold text-xl ss:text-xll uppercase text-gray-900">
              Courses Offered for {level} Level
              {Number(level) >= 400 && <span className="text-sm text-gray-500 ml-2">(Clinical)</span>}
            </h2>
            <p className="heading-p">
              The details for{" "}
              <span className="text-green1 font-semibold">
                {semester === "First" ? "Harmattan" : "Rain"}
              </span>{" "}
              Semester courses are as follows
            </p>
            <div className="flex items-center justify-center my-2 gap-1">
              <button
                onClick={() => setSemester("First")}
                className={`p-2 text-ss sm:text-xs rounded-md ${semester === "First" ? "bg-green1 text-white" : "bg-gray-100"} font-semibold transition duration-100`}
              >
                1st Semester
              </button>
              <button
                onClick={() => setSemester("Second")}
                className={`p-2 text-ss sm:text-xs rounded-md ${semester === "Second" ? "bg-green1 text-white" : "bg-gray-100"} font-semibold transition duration-100`}
              >
                2nd Semester
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="w-8 h-8 text-gray-200 animate-spin fill-green1" />
            </div>
          ) : outlines.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No course outlines available</p>
              <p className="text-sm mt-2">
                Course outlines for {level} Level {semester} Semester haven't been added yet.
              </p>
            </div>
          ) : (
            <div className="grid items-center ss:px-8 sm:px-0 sm:grid-cols-2 mmd:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
              {outlines.map((info, index) => (
                <motion.div
                  key={info.courseCode || index}
                  variants={fadeInVariants1}
                  initial="initial"
                  whileInView="animate"
                  viewport={{
                    once: true,
                  }}
                  custom={index}
                >
                  <CourseOutlineCard {...info} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
