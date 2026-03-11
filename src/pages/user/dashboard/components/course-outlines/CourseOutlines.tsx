/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { OutlineIcon } from "../../../../../components/icons/dashboard/Outline";
import reading from "../../../../../assets/svg/illustrations/reading.svg";
import { db } from "../../../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Spinner } from "../../../../../components/loaders/Spinner";
import { useGetUserInfo } from "../../../../../hooks/auth/useGetUserInfo";
import { Link } from "react-router-dom";

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
}

interface CourseInfoDisplay {
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  creditUnits: string;
  preRequisite: string | null;
  info: { heading: string; content: string }[];
}

export default function CourseOutlines() {
  const { studentDetails } = useGetUserInfo();
  const [semester, setSemester] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [course, setCourse] = useState<string | null>(null);
  const [courseInfo, setCourseInfo] = useState<CourseInfoDisplay | null>(null);
  const [availableCourses, setAvailableCourses] = useState<CourseOutlineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allOutlines, setAllOutlines] = useState<CourseOutlineEntry[]>([]);
  
  // Check if user is admin
  const isAdmin = studentDetails?.email === "patronkwo@gmail.com" || studentDetails?.email?.includes("admin");

  // Fetch all course outlines from Firestore on mount
  useEffect(() => {
    const fetchAllOutlines = async () => {
      try {
        const snapshot = await getDocs(collection(db, "courseOutlines"));
        const outlines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CourseOutlineEntry[];
        setAllOutlines(outlines);
      } catch (error) {
        console.error("Error fetching course outlines:", error);
      }
    };
    fetchAllOutlines();
  }, []);

  // Update available courses when level and semester change (only Firestore data)
  useEffect(() => {
    if (level && semester) {
      setCourse(null);
      setCourseInfo(null);
      
      // Get courses from Firestore only (admin-created outlines)
      const firestoreCourses = allOutlines.filter(
        (o) => o.level === level && o.semester === semester
      );
      
      setAvailableCourses(firestoreCourses);
    } else {
      setAvailableCourses([]);
    }
  }, [level, semester, allOutlines]);

  // Fetch course info when course is selected
  useEffect(() => {
    if (!semester || !course || !level) {
      setCourseInfo(null);
      return;
    }

    setIsLoading(true);

    // Find in Firestore data only
    const firestoreOutline = allOutlines.find(
      (o) => o.level === level && o.semester === semester && o.courseCode === course
    );

    if (firestoreOutline) {
      setCourseInfo({
        courseCode: firestoreOutline.courseCode,
        courseTitle: firestoreOutline.courseTitle,
        creditUnit: firestoreOutline.creditUnit,
        creditUnits: firestoreOutline.creditUnits,
        preRequisite: firestoreOutline.preRequisite,
        info: firestoreOutline.info,
      });
    } else {
      setCourseInfo(null);
    }
    
    setIsLoading(false);
  }, [level, course, semester, allOutlines]);
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="box-width">
        <div className="px-3 ss:px-8 sm:px-14 sm:py-24 pt-20">
          <div className="w-full flex items-center justify-center mb-6 flex-col">
            <div className="mb-4">
              <h1 className="text-md sm:text-xll md:text-2xl font-semibold uppercase text-gray-900 text-center">
                {" "}
                Course outlines
              </h1>
              <p className="section-p text-center">
                Select your level, semester and course code
              </p>
              {/* Admin Quick Link */}
              {isAdmin && (
                <div className="mt-3 flex justify-center">
                  <Link
                    to="/admin?tab=outlines"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green1 hover:bg-green2 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Manage Course Outlines
                  </Link>
                </div>
              )}
            </div>
            <div className="flex gap-1 ss:gap-5 mb-4">
              <div>
                <select
                  onChange={(e) => {
                    setLevel(e.target.value);
                  }}
                  id="underline_select"
                  className="bg-white cursor-pointer border-none shadow text-gray-900 text-xss xss:text-ss ss:text-sm font-medium rounded-lg border border-transparent focus:ring-green1 focus:border-gray-500 block w-full p-1.5 sm:p-2 "
                >
                  <option selected disabled>
                    Select Level
                  </option>
                  <option value="100">100L</option>
                  <option value="200">200L</option>
                  <option value="300">300L</option>
                  <option value="400">400L (Clinical)</option>
                  <option value="500">500L (Clinical)</option>
                  <option value="600">600L (Clinical)</option>
                </select>
              </div>{" "}
              <div>
                <select
                  onChange={(e) => {
                    setSemester(e.target.value);
                  }}
                  id="underline_select"
                  className="bg-white cursor-pointer border-none shadow text-gray-900 text-xss xss:text-ss ss:text-sm font-medium rounded-lg border border-transparent focus:ring-green1 focus:border-gray-500 block w-full p-1.5 sm:p-2 "
                >
                  <option selected value={"Select Semester"} disabled>
                    Select Semester
                  </option>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>{" "}
              <div>
                <select
                  id="underline_select"
                  onChange={(e) => setCourse(e.target.value)}
                  value={course || ""}
                  disabled={!level || !semester}
                  className="bg-white cursor-pointer border-none shadow text-gray-900 text-xss xss:text-ss ss:text-sm font-medium rounded-lg border border-transparent focus:ring-green1 focus:border-gray-500 block w-full p-1.5 sm:p-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {!level || !semester ? "Select level & semester first" : availableCourses.length === 0 ? "No courses available" : "Select Course"}
                  </option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.courseCode}>
                      {c.courseCode} - {c.courseTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {isLoading ? (
              <div className="w-full mt-10 flex items-center justify-center flex-col gap-3">
                <Spinner className="w-8 h-8 text-gray-200 animate-spin fill-green1" />
                <p className="text-sm text-gray-600">Loading course information...</p>
              </div>
            ) : courseInfo ? (
              <div className="course-info rounded-lg bg-white shadow p-3 sm:p-6 max-w-2xl relative animate-fadeIn">
                <div className="relative">
                  <OutlineIcon className="fill-green1 w-4 h-4 xss:w-6 xss:h-6 absolute top-0 right-0" />
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 text-xs sm:text-base md:text-md ">
                      {courseInfo.courseTitle}
                    </h4>
                    <p className="text-gray-800 font-medium text-sm sm:text-xs md:text-xs ">
                      Course Code:{" "}
                      <span className="font-semibold">
                        {courseInfo.courseCode}
                      </span>
                    </p>
                    <p className="text-gray-800 font-medium text-sm sm:text-xs md:text-xs ">
                      Credit Unit:{" "}
                      <span className="font-semibold">
                        {courseInfo.creditUnit}
                      </span>
                    </p>
                    {courseInfo.creditUnits && (
                      <p className="text-gray-800 font-medium text-sm sm:text-xs md:text-xs ">
                        Credit Units:{" "}
                        <span className="font-semibold">
                          {courseInfo.creditUnits}
                        </span>
                      </p>
                    )}
                    {courseInfo.preRequisite && (
                      <p className="text-gray-800 font-medium text-sm sm:text-xs md:text-xs ">
                        Pre-Requisite:{" "}
                        <span className="font-semibold">
                          {courseInfo.preRequisite}
                        </span>
                      </p>
                    )}
                  </div>

                  {courseInfo.info.map(({ heading, content }, index) => (
                    <div className="mb-4" key={index}>
                      {heading && (
                        <p className="font-semibold text-gray-800 text-sm sm:text-xs md:text-xs">
                          {heading}
                        </p>
                      )}
                      <p className=" text-gray-700 font-medium text-ss md:text-sm">
                        {content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full mt-10 flex items-center justify-center flex-col gap-3">
                <img
                  src={reading}
                  alt={"Choose a level, semester and course code"}
                  className=" w-[70%] xss:w-[200px] sm:w-[230px]"
                />
                <p className="text-sm ss:text-xs text-gray-700 font-medium text-center">
                  {level && semester && availableCourses.length === 0 
                    ? "No course outlines available for this selection yet."
                    : "Select a level, semester and course respectively."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
