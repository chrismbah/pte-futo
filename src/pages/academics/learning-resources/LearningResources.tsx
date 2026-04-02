import { useState, useEffect } from "react";
import Footer from "../../../components/footer/Footer";
import { LevelsCard } from "./LevelsCard";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInVariants1 } from "../../../animation/variants";
import { db, isFirebaseConfigured } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { LevelCard } from "../../../models/academics/learning-resources";
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import { Link, useNavigate } from "react-router-dom";
import { notifyUser } from "../../../helpers/notifyUser";
import { LockKeyhole, BookOpen, X, Loader2 } from "lucide-react";

interface AdminMaterial {
  id: string;
  level: string;
  courseCode: string;
  courseTitle?: string;
}

export default function LearningResources() {
  const [preclinicalLevels, setPreclinicalLevels] = useState<LevelCard[]>([]);
  const [clinicalLevels, setClinicalLevels] = useState<LevelCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { user, loading: authLoading } = useGetUserInfo();
  const navigate = useNavigate();

  // Redirect authenticated users to the academic library
  useEffect(() => {
    if (!authLoading && user) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        navigate("/u/learning-resources");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, navigate]);

  // Show login modal and toast when user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginModal(true);
      notifyUser("info", "Please login to access learning resources");
    }
  }, [user, authLoading]);

  useEffect(() => {
    const fetchLevelsFromMaterials = async () => {
      if (!isFirebaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all learning materials and extract unique levels
        const snapshot = await getDocs(collection(db, "learningMaterials"));
        const materials = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdminMaterial[];

        // Extract unique levels from materials
        const uniqueLevels = new Set(materials.map(m => m.level));
        
        // Define level metadata
        const levelMetadata: Record<string, { title: string; desc: string; section: "preclinical" | "clinical" }> = {
          "100": { title: "100 Level (Year 1)", desc: "Basic sciences foundation: Physics, Chemistry, Biology, Mathematics", section: "preclinical" },
          "200": { title: "200 Level (Year 2)", desc: "Anatomy, Physiology, and Biochemistry - Introduction to the human body", section: "preclinical" },
          "300": { title: "300 Level (Year 3)", desc: "Advanced Anatomy, Physiology, and Biochemistry", section: "preclinical" },
          "400": { title: "400 Level (Year 4)", desc: "Pathology, Pharmacology, Microbiology - Disease mechanisms", section: "clinical" },
          "500": { title: "500 Level (Year 5)", desc: "Clinical rotations: Medicine, Surgery, Paediatrics, O&G", section: "clinical" },
          "600": { title: "600 Level (Year 6)", desc: "Final clinical rotations and MBBS examination preparation", section: "clinical" },
        };

        const preclinical: LevelCard[] = [];
        const clinical: LevelCard[] = [];

        // Create level cards only for levels that have materials
        Array.from(uniqueLevels).sort().forEach(level => {
          const meta = levelMetadata[level];
          if (meta) {
            const card: LevelCard = {
              level,
              title: meta.title,
              desc: meta.desc,
              section: meta.section,
            };
            if (meta.section === "preclinical") {
              preclinical.push(card);
            } else {
              clinical.push(card);
            }
          }
        });

        setPreclinicalLevels(preclinical);
        setClinicalLevels(clinical);
      } catch (error) {
        console.error("Error fetching levels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevelsFromMaterials();
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Redirecting Overlay for Authenticated Users */}
      <AnimatePresence>
        {isRedirecting && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center px-6"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-green1/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-green1" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <Loader2 className="w-20 h-20 text-green1/30" />
                </motion.div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Please wait...
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Taking you to the Academic Library now
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-1 bg-green1 rounded-full mt-6 max-w-[200px]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Required Modal */}
      <AnimatePresence>
        {showLoginModal && !user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            >
              {/* Close button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="w-20 h-20 bg-green1/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-green1" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center border-2 border-white">
                    <LockKeyhole className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Login Required
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Access textbooks, handouts, past questions, and study materials by signing into your account.
                </p>
              </div>

              {/* Benefits list */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-3">What you get access to:</p>
                <ul className="space-y-2">
                  {["Lecture handouts & notes", "Recommended textbooks", "Past questions & answers", "Study tips & guides"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-green1 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                <Link
                  to="/login?redirect=/u/learning-resources"
                  className="w-full py-3 px-4 bg-green1 hover:bg-green2 text-white font-semibold rounded-xl transition-colors text-center"
                >
                  Login to Continue
                </Link>
                <Link
                  to="/signup?redirect=/u/learning-resources"
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors text-center"
                >
                  Create Free Account
                </Link>
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">
                Join thousands of medical students already using our resources
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="box-width ">
        <div className="page-section">
          <div className="w-full flex items-center justify-center mb-6 flex-col">
            <h2 className=" text-center font-bold text-xl ss:text-xll uppercase text-gray-900">
              Learning Resources
            </h2>
            <p className="heading-p">
              Find textbooks, lecturers handouts, past questions, lecture notes,
              and study tips organized by level for easy access.
            </p>
          </div>

          {/* Google Drive Full Access Banner */}
          <div className="mb-10 bg-gradient-to-br from-green1/5 to-green2/10 border border-green1/20 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green1/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Full Resource Library on Google Drive</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Click on the following links to have full access to all EBSUMSA learning materials organized by year group.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href="https://drive.google.com/folderview?id=1-JZRq-aFQzkN04ViATbH2vbCt_qgTUQg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white border border-green1/30 rounded-xl p-4 hover:border-green1 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-green1/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green1/20 transition-colors">
                  <svg className="w-5 h-5 text-green1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">Preclinicals Drive</p>
                  <p className="text-xs text-gray-500">Years 1 – 3 (100L – 300L)</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-green1 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="https://drive.google.com/folderview?id=1--udSwv2mWUf39QGa2yL2wnOpENLtgxX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white border border-green1/30 rounded-xl p-4 hover:border-green1 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-green1/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green1/20 transition-colors">
                  <svg className="w-5 h-5 text-green1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">Clinicals Drive</p>
                  <p className="text-xs text-gray-500">Years 4 – 6 (400L – 600L)</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-green1 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Preclinical Section */}
          <div className="mb-10">
            <div className="mb-4">
              <h3 className="text-lg ss:text-xl font-bold text-gray-800 mb-1">
                Preclinical (Year 1-3)
              </h3>
              <p className="text-sm text-gray-600">
                Basic sciences and foundational medical sciences: Anatomy, Physiology, Biochemistry
              </p>
            </div>
            <div className="grid items-center ss:grid-cols-2 md:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green2"></div>
                </div>
              ) : preclinicalLevels.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>No preclinical resources available yet.</p>
                  <p className="text-sm mt-2">Check back later or contact admin.</p>
                </div>
              ) : (
                preclinicalLevels.map((info, index) => (
                  <motion.div
                    key={`preclinical-${index}`}
                    variants={fadeInVariants1}
                    initial="initial"
                    whileInView="animate"
                    viewport={{
                      once: true,
                    }}
                    custom={index}
                  >
                    <LevelsCard {...info} />
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Clinical Section */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg ss:text-xl font-bold text-gray-800 mb-1">
                Clinical (Year 4-6)
              </h3>
              <p className="text-sm text-gray-600">
                Pathology, Pharmacology, and Clinical Rotations: Medicine, Surgery, Paediatrics, O&G
              </p>
            </div>
            <div className="grid items-center ss:grid-cols-2 md:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green2"></div>
                </div>
              ) : clinicalLevels.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>No clinical resources available yet.</p>
                  <p className="text-sm mt-2">Check back later or contact admin.</p>
                </div>
              ) : (
                clinicalLevels.map((info, index) => (
                  <motion.div
                    key={`clinical-${index}`}
                    variants={fadeInVariants1}
                    initial="initial"
                    whileInView="animate"
                    viewport={{
                      once: true,
                    }}
                    custom={index}
                  >
                    <LevelsCard {...info} />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
