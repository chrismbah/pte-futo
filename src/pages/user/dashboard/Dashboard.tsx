/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import Lottie from "lottie-react";
import profile from "../../../json/animation/avatar1.json";
import { NavLink, useNavigate } from "react-router-dom";
import { Spinner } from "../../../components/loaders/Spinner";
import { BadNetworkIcon } from "../../../components/icons/general/BadNetworkIcon";
import { BooksIcon } from "../../../components/icons/dashboard/BooksIcon";
import { FilesIcon } from "../../../components/icons/dashboard/FilesIcon";
import { ChatIcon } from "../../../components/icons/dashboard/ChatIcon";
import { IDCardIcon } from "../../../components/icons/dashboard/IDCardIcon";
import { ResourcesIcon } from "../../../components/icons/dashboard/ResourcesIcon";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";
import { useLoadImage } from "../../../hooks/user-profile/useLoadImage";
import { useNotifications } from "../../../hooks/notifications/useNotifications";
import WeatherWidget from "../../../components/widgets/WeatherWidget";
import CommunityWidget from "../../../components/widgets/CommunityWidget";
import EventsWidget from "../../../components/widgets/EventsWidget";
import { trackActivity } from "../../../hooks/analytics/useAnalytics";
import { db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import AdvertisementBanner from "../../../components/shared/AdvertisementBanner";
import WalletCard from "../../../components/widgets/WalletCard";
import PremiumCard from "../../../components/widgets/PremiumCard";

// Activity types with icons and colors
interface Activity {
  id: string;
  type: "login" | "resource" | "profile" | "course" | "id_card";
  title: string;
  description: string;
  timestamp: Date;
  link?: string;
}

// Generate sample activities based on user data
const generateActivities = (studentDetails: any): Activity[] => {
  const activities: Activity[] = [
    {
      id: "1",
      type: "login",
      title: "Logged in successfully",
      description: "Welcome back to the EBSU portal",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "resource",
      title: "Learning Resources accessed",
      description: "Viewed Anatomy study materials",
      timestamp: new Date(Date.now() - 3600000),
      link: "/u/learning-resources",
    },
    {
      id: "3",
      type: "course",
      title: "Course Outline viewed",
      description: `${studentDetails?.level || "200L"} course outlines`,
      timestamp: new Date(Date.now() - 86400000),
      link: "/u/course-outlines",
    },
    {
      id: "4",
      type: "profile",
      title: "Profile updated",
      description: "Profile information updated",
      timestamp: new Date(Date.now() - 172800000),
      link: "/u/profile",
    },
  ];
  return activities;
};

export default function Dashboard() {
  const { studentDetails, gettingStudentDetails, gettingStudentDetailsErr } =
    useGetUserInfo();
  const { isImageLoading, setIsImageLoading, LoadingPlaceholder } =
    useLoadImage();
  const { notifications, markAsRead, formatRelativeTime } = useNotifications();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contactModal, setContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("dashboard-dark") === "true";
  });

  const toggleDark = () => {
    setIsDark((prev) => {
      localStorage.setItem("dashboard-dark", String(!prev));
      return !prev;
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) return;
    setSendingMessage(true);
    try {
      await addDoc(collection(db, "adminMessages"), {
        userId: studentDetails?.userID || "",
        name: `${studentDetails?.firstName || ""} ${studentDetails?.lastName || ""}`.trim(),
        email: studentDetails?.email || "",
        level: studentDetails?.level || "",
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim(),
        status: "unread",
        reply: null,
        createdAt: serverTimestamp(),
      });
      setMessageSent(true);
      setContactForm({ subject: "", message: "" });
    } catch {
      // silent — user sees no change, can retry
    } finally {
      setSendingMessage(false);
    }
  };

  // Generate activities when student details are available
  useEffect(() => {
    if (studentDetails) {
      setActivities(generateActivities(studentDetails));
      trackActivity("page_visit", "Dashboard");
    }
  }, [studentDetails]);

  // Format timestamp for activities
  const formatActivityTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Get activity icon
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "login":
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "resource":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case "course":
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case "profile":
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Get notification type icon and color
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "success":
        return { bg: "bg-green-100", text: "text-green-600", icon: "M5 13l4 4L19 7" };
      case "warning":
        return { bg: "bg-yellow-100", text: "text-yellow-600", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" };
      case "info":
        return { bg: "bg-blue-100", text: "text-blue-600", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" };
      case "announcement":
        return { bg: "bg-purple-100", text: "text-purple-600", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" };
    }
  };

  // useEffect(() => {
  //   if (studentDetails && studentDetails.profileImageURL.length > 0) {
  //     setIsImageLoading(true);
  //   }
  // }, []);

  return (
    <>
      {studentDetails ? (
        <>
        <div className={`min-h-screen overflow-x-auto transition-colors duration-300 ${isDark ? "dashboard-dark bg-[#0f172a]" : "bg-white"}`}>
          <div className="max-w-[1720px] w-full mx-auto px-3 xxss:px-4 sm:px-6 lg:px-8 lg:pr-12">
            <div className="pt-[70px] xxss:pt-[80px] ss:pt-[90px] sm:pt-[105px] pb-4">
              {/* Dark / Light mode toggle */}
              <div className="flex justify-end mb-3">
                <button
                  onClick={toggleDark}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
                    isDark
                      ? "bg-[#1e293b] border-[#334155] text-slate-200 hover:bg-[#334155]"
                      : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {isDark ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm7.07 2.93a1 1 0 010 1.41l-.71.71a1 1 0 01-1.41-1.41l.71-.71a1 1 0 011.41 0zM21 11h-1a1 1 0 010-2h1a1 1 0 010 2zm-2.93 7.07a1 1 0 01-1.41 0l-.71-.71a1 1 0 011.41-1.41l.71.71a1 1 0 010 1.41zM12 18a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zm-7.07-1.93a1 1 0 010-1.41l.71-.71a1 1 0 011.41 1.41l-.71.71a1 1 0 01-1.41 0zM4 11H3a1 1 0 010-2h1a1 1 0 010 2zm1.64-6.36a1 1 0 011.41 0l.71.71A1 1 0 016.35 6.76l-.71-.71a1 1 0 010-1.41zM12 7a5 5 0 110 10A5 5 0 0112 7z" />
                      </svg>
                      Light Mode
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                      </svg>
                      Dark Mode
                    </>
                  )}
                </button>
              </div>
              <div className="grid lg:grid-cols-7 gap-3 sm:gap-4">
                <div className="w-full lg:col-span-2 px-0 sm:px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-rows-3 lg:grid-cols-none gap-3 sm:gap-4 mb-4 lg:mb-0">
                  <motion.div
                    variants={fadeInVariants5}
                    initial="initial"
                    whileInView="animate"
                    viewport={{
                      once: true,
                    }}
                    custom={1}
                    className="shadow rounded-lg bg-white w-full row-span-1"
                  >
                    <div className="p-3 xxss:p-4">
                      <div className="flex items-center justify-center">
                        {studentDetails &&
                        studentDetails?.profileImageURL.length > 0 ? (
                          <div className=" overflow-hidden w-24 h-24 xxss:h-28 xxss:w-28 sm:w-36 sm:h-36 md:w-32 md:h-32 rounded-full">
                            {isImageLoading ? (
                              <LoadingPlaceholder />
                            ) : (
                              !isImageLoading && (
                                <img
                                  src={studentDetails?.profileImageURL}
                                  alt={studentDetails?.firstName}
                                  className="w-full h-full object-cover rounded-full"
                                  onLoad={() => setIsImageLoading(false)}
                                />
                              )
                            )}
                          </div>
                        ) : (
                          <Lottie
                            animationData={profile}
                            loop={false}
                            className="w-28 h-28 md:w-32 md:h-32 sm:w-36 sm:h-36 rounded-full object-cover"
                          />
                        )}
                      </div>
                      <div className="mt-4 mb-5 sm:mb-8">
                        <p className="text-center text-xs sm:text-base md:text-xll uppercase font-semibold text-gray-900 break-all">
                          {studentDetails?.firstName +
                            " " +
                            studentDetails?.lastName}
                        </p>
                        <p className="text-center text-xss sm:text-ss md:text-sm uppercase font-semibold text-gray-600">
                          {studentDetails?.level === "Visitor"
                            ? "VISITOR"
                            : studentDetails?.level === "Aspirant"
                              ? "ASPIRANT"
                              : studentDetails?.level.slice(
                                  0,
                                  studentDetails?.level.length - 1
                                ) + " LEVEL"}
                        </p>
                      </div>
                      <NavLink
                        to="/u/profile"
                        className="flex items-center justify-center"
                      >
                        <button className="w-full text-white text-sm sm:text-xs transition duration-200 ease-in-out rounded-lg bg-green2 hover:bg-green2/95 p-3 font-semibold">
                          Check Profile
                        </button>
                      </NavLink>
                    </div>
                  </motion.div>
                  <motion.div
                    variants={fadeInVariants5}
                    initial="initial"
                    whileInView="animate"
                    viewport={{
                      once: true,
                    }}
                    custom={3}
                    className="details bg-white shadow px-3 xxss:px-4 py-4 xxss:py-6 rounded-lg w-full lg:h-fit"
                  >
                    <div className="flex items-center justify-between flex-col h-full">
                      <div className="flex items-center justify-between gap-4 xxss:gap-2 mb-4 w-full flex-col xxss:flex-row">
                        <div className="w-full">
                          <p className="uppercase text-gray-500 font-bold text-ss ss:text-sm">
                            Registered Date
                          </p>
                          <p className="text-gray-800 text-ss sm:text-sm ss:text-xs font-medium">
                            {studentDetails?.registeredDate}
                          </p>
                        </div>
                        <div className="w-full xxss:text-right">
                          <p className="uppercase  text-gray-500 font-bold text-ss ss:text-sm">
                            Registered Time
                          </p>
                          <p className="text-gray-800 text-ss sm:text-sm ss:text-xs font-medium">
                            {studentDetails?.registeredTime}
                          </p>
                        </div>
                      </div>
                      <div className="mb-4 w-full">
                        <p className="uppercase text-gray-500 font-bold text-ss ss:text-sm">
                          Email
                        </p>
                        <p className="text-gray-800 text-ss sm:text-sm ss:text-xs font-medium">
                          {studentDetails?.email}
                        </p>
                      </div>
                      <div className="mb-4 w-full">
                        <p className="uppercase text-gray-500 font-bold text-ss ss:text-sm">
                          Department
                        </p>
                        <p className="text-gray-800 text-ss sm:text-sm ss:text-xs font-medium">
                          {studentDetails?.level !== "Aspirant" &&
                          studentDetails?.level !== "Visitor"
                            ? "Medicine and Surgery"
                            : "None"}
                        </p>
                      </div>
                      <div className="w-full">
                        <p className="uppercase text-gray-500 font-bold text-ss ss:text-sm">
                          Matric No.
                        </p>
                        <p className="text-gray-800 text-ss sm:text-sm ss:text-xs font-medium">
                          {studentDetails?.regNo
                            ? studentDetails?.regNo
                            : "None"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  {/* Weather Widget */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <WeatherWidget customIndex={5} />
                  </div>
                  {/* Community Widget */}
                  <motion.div
                    variants={fadeInVariants5}
                    initial="initial"
                    whileInView="animate"
                    viewport={{
                      once: true,
                    }}
                    custom={6}
                    className="sm:col-span-2 lg:col-span-1"
                  >
                    <CommunityWidget />
                  </motion.div>
                  {/* Events & Calendar Widget */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <EventsWidget customIndex={7} />
                  </div>
                </div>
                <div className="lg:col-span-5 px-0 sm:px-4 h-full mb-5 lg:mb-0">
                  {/* Advertisement Banner */}
                  <AdvertisementBanner className="mb-3 sm:mb-4" />
                  <div className="mb-3 sm:mb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 xxss:gap-3 sm:gap-4 auto-rows-max">
                      <NavLink to="/u/course-outlines">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={7}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#bef264] bg-[#bef264]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                        >
                          <BooksIcon
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#00875a"
                          />
                          <p className="uppercase text-[#00875a] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                            Course Outlines
                          </p>
                        </motion.div>
                      </NavLink>
                      <NavLink to="/u/learning-resources">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={9}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#93c5fd] bg-[#93c5fd]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                        >
                          <FilesIcon
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#1d4ed8"
                          />
                          <p className="uppercase text-[#1d4ed8] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                            Learning Resources
                          </p>
                        </motion.div>
                      </NavLink>
                      <NavLink to="/u/study-ai">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={10}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#c7d2fe] bg-[#c7d2fe]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                        >
                          <svg
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#4338ca"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                            <line x1="2" y1="20" x2="22" y2="20" />
                          </svg>
                          <p className="uppercase text-[#4338ca] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                            Analytics
                          </p>
                        </motion.div>
                      </NavLink>
                      <NavLink to="/u/ai-assistant">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={11}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#6ee7b7] bg-[#6ee7b7]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                        >
                          <ChatIcon
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#047857"
                          />
                          <p className="uppercase text-[#047857] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                            AI Assistant
                          </p>
                        </motion.div>
                      </NavLink>
                      {/* Quiz Card */}
                      <NavLink to="/u/quiz-card">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{ once: true }}
                          custom={14}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#fde68a] bg-[#fde68a]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                        >
                          <svg
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#b45309"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                          </svg>
                          <p className="uppercase text-[#b45309] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                            Quiz Card
                          </p>
                        </motion.div>
                      </NavLink>
                      {/* Wallet Card */}
                      <WalletCard userID={studentDetails?.userID || ""} userEmail={studentDetails?.email || ""} />

                      {/* AI Note Summarizer Card */}
                      <NavLink to="/u/ai-notes">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{ once: true }}
                          custom={15}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#a5f3fc] bg-[#a5f3fc]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                        >
                          <svg
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#0e7490"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                            <circle cx="18" cy="20" r="3" fill="#0e7490" stroke="none" />
                            <path d="M17.5 19.5l.5.5 1-1" stroke="white" strokeWidth="1.2" />
                          </svg>
                          <p className="uppercase text-[#0e7490] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                            AI Notes
                          </p>
                        </motion.div>
                      </NavLink>

                      {/* Premium Package Card */}
                      <PremiumCard userID={studentDetails?.userID || ""} userEmail={studentDetails?.email || ""} />
                    </div>
                  </div>
                  <div className="mb-3 sm:mb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 xxss:gap-3 sm:gap-4 auto-rows-max">
                      <NavLink to="/u/id-card-payment">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={12}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#fcd34d] bg-[#fcd34d]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                        >
                          <IDCardIcon
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#b45309"
                          />
                          <p className="uppercase text-[#b45309] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                            ID Card Registration
                          </p>
                        </motion.div>
                      </NavLink>
                      {/* Fee Payment Card */}
                      <NavLink to="/u/fees">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={17}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-gradient-to-br hover:from-cyan-400 hover:to-blue-500 bg-gradient-to-br from-cyan-400/90 to-blue-500/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center relative overflow-hidden group"
                        >
                          {/* Decorative elements */}
                          <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500" />
                          <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/10 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
                          <svg
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20 relative z-10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                          </svg>
                          <p className="uppercase text-white text-sss xxss:text-xss sm:text-xs lg:text-base font-bold text-center relative z-10 drop-shadow-sm">
                            Fee Payments
                          </p>
                        </motion.div>
                      </NavLink>
                      {/* School Fees Card - Remita */}
                      <NavLink to="/u/school-fees">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={18}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-600 bg-gradient-to-br from-emerald-500/90 to-teal-600/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center relative overflow-hidden group"
                        >
                          {/* Decorative elements */}
                          <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500" />
                          <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/10 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
                          <svg
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20 relative z-10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                          </svg>
                          <p className="uppercase text-white text-sss xxss:text-xss sm:text-xs lg:text-base font-bold text-center relative z-10 drop-shadow-sm">
                            School Fees
                          </p>
                          <span className="absolute bottom-1 right-2 text-[8px] text-white/60 font-medium">REMITA</span>
                        </motion.div>
                      </NavLink>
                      <NavLink to="/u/resources">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={13}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#c4b5fd] bg-[#c4b5fd]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                        >
                          <ResourcesIcon
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#7c3aed"
                          />
                          <p className="uppercase text-[#7c3aed] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                            Study Materials
                          </p>
                        </motion.div>
                      </NavLink>
                      {/* Contact Admin Card — visible to all users */}
                      <motion.div
                        variants={fadeInVariants5}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        custom={16}
                        onClick={() => { setContactModal(true); setMessageSent(false); }}
                        className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] cursor-pointer transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#bbf7d0] bg-[#bbf7d0]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                      >
                        <svg
                          className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#15803d"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                          <line x1="9" y1="10" x2="15" y2="10" />
                          <line x1="9" y1="14" x2="13" y2="14" />
                        </svg>
                        <p className="uppercase text-[#15803d] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                          Contact Admin
                        </p>
                      </motion.div>

                      {/* Events & Calendar Card */}
                      <NavLink to="/u/events">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{ once: true }}
                          custom={17}
                          className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] cursor-pointer transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#d1fae5] bg-[#d1fae5]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                        >
                          <svg
                            className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#065f46"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <circle cx="8" cy="15" r="1" fill="#065f46" />
                            <circle cx="12" cy="15" r="1" fill="#065f46" />
                            <circle cx="16" cy="15" r="1" fill="#065f46" />
                          </svg>
                          <p className="uppercase text-[#065f46] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                            Events & Calendar
                          </p>
                        </motion.div>
                      </NavLink>

                      {/* Admin Panel Link - Only visible to admin */}
                      {(["patronkwo@gmail.com","kenronkwo@gmail.com","ebsumsapresident2526@gmail.com","ebsumsa102@gmail.com","oohveeyuu070@gmail.com"].includes((studentDetails?.email || '').toLowerCase()) || studentDetails?.email?.toLowerCase().includes("admin")) && (
                        <NavLink to="/admin">
                          <motion.div
                            variants={fadeInVariants5}
                            initial="initial"
                            whileInView="animate"
                            viewport={{
                              once: true,
                            }}
                            custom={17}
                            className="w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 hover:bg-[#fca5a5] bg-[#fca5a5]/90 flex gap-3 xxss:gap-4 sm:gap-6 flex-col items-center justify-center"
                          >
                            <svg
                              className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                              fill="#dc2626"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                            </svg>
                            <p className="uppercase text-[#dc2626] text-sss xxss:text-xss sm:text-xs lg:text-base font-semibold text-center">
                              Admin Panel
                            </p>
                          </motion.div>
                        </NavLink>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 mmd:gap-4">
                    {/* Recent Activities Section */}
                    <motion.div
                      variants={fadeInVariants5}
                      initial="initial"
                      whileInView="animate"
                      viewport={{
                        once: true,
                      }}
                      custom={11}
                      className="shadow rounded-lg w-full py-2 bg-white h-[280px] xxss:h-[300px] sm:h-[340px] flex flex-col"
                    >
                      <div className="text-xss xxss:text-xs sm:text-sm md:text-base p-2 border-b border-gray-300 font-bold text-gray-800 flex items-center justify-between">
                        <span>Recent Activities</span>
                        <span className="text-xss xxss:text-xs font-normal text-gray-500">{activities.length} items</span>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {activities.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {activities.map((activity) => (
                              <div
                                key={activity.id}
                                onClick={() => activity.link && navigate(activity.link)}
                                className={`p-2 xxss:p-3 flex items-start gap-2 xxss:gap-3 hover:bg-gray-50 transition-colors ${activity.link ? 'cursor-pointer' : ''}`}
                              >
                                {getActivityIcon(activity.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate">
                                    {activity.title}
                                  </p>
                                  <p className="text-sss xxss:text-xss sm:text-xs text-gray-500 truncate">
                                    {activity.description}
                                  </p>
                                </div>
                                <span className="text-sss xxss:text-xss text-gray-400 whitespace-nowrap hidden xxss:block">
                                  {formatActivityTime(activity.timestamp)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center py-6 flex-col">
                            <svg className="w-16 h-16 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-center text-sm text-gray-500">
                              No activities yet
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Notifications Section */}
                    <motion.div
                      variants={fadeInVariants5}
                      initial="initial"
                      whileInView="animate"
                      viewport={{
                        once: true,
                      }}
                      custom={13}
                      className="shadow rounded-lg w-full py-2 bg-white h-[280px] xxss:h-[300px] sm:h-[340px] flex flex-col"
                    >
                      <div className="text-xss xxss:text-xs sm:text-sm md:text-base p-2 border-b border-gray-300 font-bold text-gray-800 flex items-center justify-between">
                        <span>Notifications</span>
                        {notifications.filter(n => !n.read).length > 0 && (
                          <span className="bg-red-500 text-white text-sss xxss:text-xss px-1.5 xxss:px-2 py-0.5 rounded-full">
                            {notifications.filter(n => !n.read).length} new
                          </span>
                        )}
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {notifications.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {notifications.slice(0, 5).map((notification) => {
                              const style = getNotificationStyle(notification.type);
                              return (
                                <div
                                  key={notification.id}
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    if (notification.link) navigate(notification.link);
                                  }}
                                  className={`p-2 xxss:p-3 flex items-start gap-2 xxss:gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                >
                                  <div className={`w-6 h-6 xxss:w-8 xxss:h-8 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                                    <svg className={`w-3 h-3 xxss:w-4 xxss:h-4 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.icon} />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xss xxss:text-xs sm:text-sm font-medium text-gray-900 truncate ${!notification.read ? 'font-semibold' : ''}`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-sss xxss:text-xss sm:text-xs text-gray-500 line-clamp-2">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-sss xxss:text-xss text-gray-400 whitespace-nowrap hidden xxss:block">
                                      {formatRelativeTime(notification.createdAt)}
                                    </span>
                                    {!notification.read && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center py-6 flex-col">
                            <svg className="w-16 h-16 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-center text-sm text-gray-500">
                              No notifications yet
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Admin Modal */}
        <AnimatePresence>
          {contactModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${isDark ? "dashboard-dark-modal" : ""}`}
              onClick={(e) => { if (e.target === e.currentTarget) setContactModal(false); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#bbf7d0] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#15803d]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Contact Admin</p>
                      <p className="text-xss text-gray-500">Send a message to the portal admin</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setContactModal(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="px-5 py-5">
                  {messageSent ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#bbf7d0] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#15803d]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-base font-semibold text-gray-900 text-center">Message Sent!</p>
                      <p className="text-sm text-gray-500 text-center text-balance">Your message has been delivered to the admin. You will be notified when there is a reply.</p>
                      <button
                        onClick={() => setContactModal(false)}
                        className="mt-2 px-6 py-2.5 rounded-xl bg-[#00875a] text-white text-sm font-semibold hover:bg-[#00875a]/90 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{studentDetails?.firstName} {studentDetails?.lastName}</p>
                          <p className="text-xss text-gray-500">{studentDetails?.email} &bull; {studentDetails?.level}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subject</label>
                        <input
                          type="text"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))}
                          placeholder="e.g. ID Card issue, Account problem..."
                          required
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message</label>
                        <textarea
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                          placeholder="Describe your issue or question in detail..."
                          required
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#00875a]/30 focus:border-[#00875a] transition-colors"
                        />
                        <p className="text-xss text-gray-400 text-right mt-0.5">{contactForm.message.length} chars</p>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setContactModal(false)}
                          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={sendingMessage || !contactForm.subject.trim() || !contactForm.message.trim()}
                          className="flex-1 py-2.5 rounded-xl bg-[#00875a] text-white text-sm font-semibold hover:bg-[#00875a]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {sendingMessage ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                              </svg>
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </>
      ) : gettingStudentDetails ? (
        <div className="w-full h-screen flex items-center justify-center flex-col gap-3">
          <Spinner className="w-8 sm:w-10" />
          <p className=" text-ss sm:text-sm md:text-xs font-semibold text-gray-800">
            Please wait...
          </p>
        </div>
      ) : (
        gettingStudentDetailsErr && (
          <div className="w-full h-[100vh] flex items-center justify-center flex-col gap-3">
            <BadNetworkIcon className="w-8 sm:w-10 md:w-16" />
            <p className=" text-sm sm:text-xs md:text-xs text-gray-800 font-semibold">
              Something went wrong.{" "}
              <button
                className="underline hover:no-underline text-green1"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </p>
          </div>
        )
      )}
    </>
  );
}
