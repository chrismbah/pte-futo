import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CoursesCard } from "./CoursesCard";
import Footer from "../../../components/footer/Footer";
import { motion } from "framer-motion";
import { fadeInVariants1 } from "../../../animation/variants";
import { db, isFirebaseConfigured } from "../../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Spinner } from "../../../components/loaders/Spinner";

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
  id: string;
  semester?: string;
}

export default function LearningResourcesCourses() {
  const { level } = useParams();
  const isClinical = level ? parseInt(level) >= 400 : false;
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin-uploaded materials to discover available courses (only admin-created)
  useEffect(() => {
    const fetchAdminMaterials = async () => {
      if (!isFirebaseConfigured || !level) {
        setIsLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "learningMaterials"),
          where("level", "==", level)
        );
        const snapshot = await getDocs(q);
        const materials = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdminMaterial[];

        // Extract unique courses from admin materials
        const uniqueCourses = new Map<string, CourseData>();
        materials.forEach(material => {
          if (!uniqueCourses.has(material.courseCode)) {
            uniqueCourses.set(material.courseCode, {
              courseCode: material.courseCode,
              courseTitle: material.courseTitle || material.courseCode,
              id: material.courseCode.replace(/\s+/g, ""),
              semester: material.semester,
            });
          }
        });

        setCourses(Array.from(uniqueCourses.values()));
      } catch (error) {
        console.error("Error fetching admin materials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminMaterials();
  }, [level]);

  // Filter courses by semester (only for preclinical)
  const getCoursesForSemester = (semester: string) => {
    return courses.filter(c => c.semester === semester);
  };

  // Get all courses (for clinical years which don't have semesters)
  const getAllCourses = () => courses;

  const getLevelDescription = () => {
    if (!level) return "";
    const numLevel = parseInt(level);
    
    if (numLevel === 100) {
      return "Download textbooks, handouts, notes and past questions compiled just for Freshers";
    } else if (numLevel === 200) {
      return "Download resources for 200 level - Introduction to Anatomy, Physiology, and Biochemistry";
    } else if (numLevel === 300) {
      return "Download resources for 300 level - Advanced Preclinical Sciences";
    } else if (numLevel === 400) {
      return "Access resources for 400 level - Pathology, Pharmacology, Microbiology, and Laboratory Medicine";
    } else if (numLevel === 500) {
      return "Access clinical resources for 500 level - Medicine, Surgery, Paediatrics, O&G, Psychiatry, and Community Medicine";
    } else if (numLevel === 600) {
      return "Access resources for Final year - Advanced Clinical Rotations and Specialty Clerkships";
    }
    return `Download textbooks, handouts, notes and past questions compiled for ${level} level students`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="box-width2">
        <div className="page-section">
          <div className="w-full flex items-center justify-center mb-6 flex-col">
            <h5 className="text-center font-bold text-xl ss:text-xll uppercase text-gray-900">
              {level} Level Learning Resources
            </h5>
            <p className="heading-p">{getLevelDescription()}</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="w-8 h-8 text-gray-200 animate-spin fill-green1" />
            </div>
          ) : isClinical ? (
            // Clinical years (400-600) - No semester division
            <>
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Clinical Year:</span> Courses in clinical years are organized as continuous rotations without semester divisions. 
                  Resources are grouped by specialty and clinical posting.
                </p>
              </div>
              
              <h4 className="text-base font-bold mb-4 sm:text-md">
                All Clinical Courses <div className="bar-style" />
              </h4>
              {getAllCourses().length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p>No courses available for this level yet.</p>
                  <p className="text-sm mt-2">Check back later or contact admin.</p>
                </div>
              ) : (
                <div className="mb-16 grid items-center grid-cols-2 xss:grid-cols-3 sss:grid-cols-4 mmd:grid-cols-5 gap-4">
                  {getAllCourses().map((info, i) => (
                    <motion.div
                      key={info.id || info.courseCode}
                      variants={fadeInVariants1}
                      initial="initial"
                      whileInView="animate"
                      viewport={{
                        once: true,
                      }}
                      custom={i}
                    >
                      <CoursesCard {...info} />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Preclinical years (100-300) - With semester division
            <>
              <h4 className="text-base font-bold mb-2 sm:text-md">
                First Semester <div className="bar-style" />
              </h4>
              {getCoursesForSemester("First").length === 0 ? (
                <div className="text-center py-8 text-gray-500 mb-8">
                  <p>No first semester courses available yet.</p>
                </div>
              ) : (
                <div className="mb-16 grid items-center grid-cols-2 xss:grid-cols-3 sss:grid-cols-4 mmd:grid-cols-5 gap-4">
                  {getCoursesForSemester("First").map((info, i) => (
                    <motion.div
                      key={info.id || info.courseCode}
                      variants={fadeInVariants1}
                      initial="initial"
                      whileInView="animate"
                      viewport={{
                        once: true,
                      }}
                      custom={i}
                    >
                      <CoursesCard {...info} />
                    </motion.div>
                  ))}
                </div>
              )}

              {getCoursesForSemester("Second").length > 0 && (
                <>
                  <h4 className="text-base font-bold mb-2 sm:text-md">
                    Second Semester <div className="bar-style" />
                  </h4>
                  <div className="mb-16 grid items-center grid-cols-2 xss:grid-cols-3 sss:grid-cols-4 mmd:grid-cols-5 gap-4">
                    {getCoursesForSemester("Second").map((info, i) => (
                      <motion.div
                        key={info.id || info.courseCode}
                        variants={fadeInVariants1}
                        initial="initial"
                        whileInView="animate"
                        viewport={{
                          once: true,
                        }}
                        custom={i}
                      >
                        <CoursesCard {...info} />
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
