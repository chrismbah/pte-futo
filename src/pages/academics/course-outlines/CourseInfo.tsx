/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OutlineIcon } from "../../../components/icons/dashboard/Outline";
import { motion } from "framer-motion";
import { fadeInVariants1 } from "../../../animation/variants";
import { db } from "../../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Spinner } from "../../../components/loaders/Spinner";

interface CourseOutlineData {
  id: string;
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  creditUnits: string;
  preRequisite: string | null;
  level: string;
  semester: "First" | "Second";
  info: { heading: string; content: string }[];
}
export default function CourseInfo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState<CourseOutlineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!id) {
        setError("Course ID not found");
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "courseOutlines", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCourseInfo({ id: docSnap.id, ...docSnap.data() } as CourseOutlineData);
        } else {
          setError("Course outline not found");
        }
      } catch (err) {
        console.error("Error fetching course outline:", err);
        setError("Failed to load course outline");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseInfo();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-gray-200 animate-spin fill-green1" />
      </div>
    );
  }

  if (error || !courseInfo) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center py-20 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">{error || "Course outline not found"}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2 bg-green1 text-white rounded-md hover:bg-green-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="flex items-center justify-center min-h-screen">
        {courseInfo && (
          <div className="max-w-[950px] px-3 pt-20 pb-8 xsm:px-10 xsm:pt-24 xsm:pb-10 ">
            <motion.div
              variants={fadeInVariants1}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              className="bg-white shadow-4 px-3 pt-10 pb-8 xsm:px-10 rounded-lg"
            >
              <div className="flex-center gap-0 ss:gap-3 flex-wrap">
                <div className="flex-center">
                  <OutlineIcon className="w-6 sm:w-8 fill-green1" />
                  <h3 className="text-base xss:text-lg sm:text-xl font-semibold text-center">
                    {courseInfo.courseTitle}
                  </h3>{" "}
                </div>
                <h3 className="text-xs xss:text-md sm:text-xl font-semibold">
                  ({courseInfo.courseCode})
                </h3>
              </div>
              <div className="flex-center gap-3 font-[400] text-sm sm:text-md mb-1 sm:mb-2">
                <p>
                  Credit Unit - {courseInfo.creditUnit}{" "}
                  {Number(courseInfo.creditUnit) > 1 ? "Units" : "Unit"}
                </p>
                {"  "}
                <span>{courseInfo.creditUnits}</span>
              </div>
              <h4 className="text-center font-semibold text-xs xss:text-base sm:text-lg">
                COURSE OUTLINE
              </h4>
              {courseInfo.preRequisite && (
                <>
                  <h4 className="text-xs sm:text-base font-semibold">
                    {" "}
                    Pre-requisite: <div className="bar-style2" />
                  </h4>
                  <p className="mb-1 sm:mb-3 text-ss sm:text-sm text-gray-700 font-medium">
                    {courseInfo.preRequisite}
                  </p>
                </>
              )}
              {courseInfo.info.map(({ heading, content }, index) => (
                <div key={index} className="py-2 mb-2 border-b border-gray-200">
                  {heading && heading === "General" ? (
                    <div className="text-xs sm:text-base font-semibold">
                      {heading}
                      <div className="bar-style2 mb-2 font-normal" />
                    </div>
                  ) : (
                    <div className="text-xs sm:text-base font-semibold">
                      {heading}
                    </div>
                  )}
                  <div className="text-ss sm:text-xs font-medium text-gray-600">
                    {" "}
                    {content}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
