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
import { CalculatorIcon } from "../../../components/icons/dashboard/CalculatorIcon";
import { BooksIcon } from "../../../components/icons/dashboard/BooksIcon";
import { FilesIcon } from "../../../components/icons/dashboard/FilesIcon";
import { ChatIcon } from "../../../components/icons/dashboard/ChatIcon";
import { IDCardIcon } from "../../../components/icons/dashboard/IDCardIcon";
import { ResourcesIcon } from "../../../components/icons/dashboard/ResourcesIcon";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../../animation/variants";
import { useLoadImage } from "../../../hooks/user-profile/useLoadImage";
import { useNotifications } from "../../../hooks/notifications/useNotifications";

// Activity types with icons and colors
interface Activity {
  id: string;
  type: "login" | "resource" | "profile" | "calculator" | "course" | "id_card";
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
      type: "calculator",
      title: "GPA Calculation",
      description: "Calculated semester GPA",
      timestamp: new Date(Date.now() - 7200000),
      link: "/u/gpa-calculator",
    },
    {
      id: "4",
      type: "course",
      title: "Course Outline viewed",
      description: `${studentDetails?.level || "200L"} course outlines`,
      timestamp: new Date(Date.now() - 86400000),
      link: "/u/course-outlines",
    },
    {
      id: "5",
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

  // Generate activities when student details are available
  useEffect(() => {
    if (studentDetails) {
      setActivities(generateActivities(studentDetails));
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
      case "calculator":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
        <div className="bg-white min-h-screen overflow-x-auto">
          <div className="min-w-[320px] max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 lg:pr-12">
            <div className="pt-[80px] ss:pt-[90px] sm:pt-[105px] pb-0">
              <div className="grid lg:grid-cols-7 gap-4">
                <div className="w-full lg:col-span-2 px-4 grid sm:grid-cols-2 lg:grid-rows-2 lg:grid-cols-none gap-4 mb-4 lg:mb-0">
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
                    <div className="p-4">
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
                    className="details bg-white shadow px-4 py-6 rounded-lg w-full lg:h-fit "
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
                </div>
                <div className="lg:col-span-5 px-4 h-full mb-5 lg:mb-0">
                  <div className="mb-4">
                    <div className="grid sss:grid-cols-2 lg:grid-cols-3 gap-4 ">
                      <NavLink to="/u/gpa-calculator">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={5}
                          className="w-full min-h-[195px] sss:h-[215px] transition duration-200 ease-in-out rounded-lg p-4 hover:bg-[#f0abfc] bg-[#f0abfc]/90 flex gap-6 flex-col items-center justify-center"
                        >
                          <CalculatorIcon
                            className=" w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#a21caf"
                          />
                          <p className="  uppercase text-[#a21caf] text-xs lg:text-base font-semibold text-center ">
                            GPA Calculator
                          </p>
                        </motion.div>
                      </NavLink>
                      <NavLink to="/u/course-outlines">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={7}
                          className="w-full min-h-[195px] sss:h-[215px] transition duration-200 ease-in-out rounded-lg p-4 hover:bg-[#bef264] bg-[#bef264]/90 flex gap-6 flex-col items-center justify-center"
                        >
                          <BooksIcon
                            className=" w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#00875a"
                          />
                          <p className="  uppercase text-[#00875a] text-xs lg:text-base font-semibold text-center ">
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
                          className="w-full min-h-[195px] sss:h-[215px] transition duration-200 ease-in-out rounded-lg p-4 hover:bg-[#93c5fd] bg-[#93c5fd]/90 flex gap-6 flex-col items-center justify-center"
                        >
                          <FilesIcon
                            className=" w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#1d4ed8"
                          />
                          <p className="  uppercase text-[#1d4ed8] text-xs lg:text-base font-semibold text-center ">
                            Learning Resources
                          </p>
                        </motion.div>
                      </NavLink>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="grid sss:grid-cols-2 lg:grid-cols-3 gap-4">
                      <NavLink to="/u/id-card">
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={11}
                          className="w-full min-h-[195px] sss:h-[215px] transition duration-200 ease-in-out rounded-lg p-4 hover:bg-[#fcd34d] bg-[#fcd34d]/90 flex gap-6 flex-col items-center justify-center"
                        >
                          <IDCardIcon
                            className="w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#b45309"
                          />
                          <p className="uppercase text-[#b45309] text-xs lg:text-base font-semibold text-center">
                            ID Card Registration
                          </p>
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
                          className="w-full min-h-[195px] sss:h-[215px] transition duration-200 ease-in-out rounded-lg p-4 hover:bg-[#c4b5fd] bg-[#c4b5fd]/90 flex gap-6 flex-col items-center justify-center"
                        >
                          <ResourcesIcon
                            className="w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#7c3aed"
                          />
                          <p className="uppercase text-[#7c3aed] text-xs lg:text-base font-semibold text-center">
                            Study Materials
                          </p>
                        </motion.div>
                      </NavLink>
                      <button
                        onClick={() => {
                          const chatButton = document.querySelector(
                            '[class*="fixed bottom-6 right-6"]'
                          ) as HTMLButtonElement;
                          if (chatButton) chatButton.click();
                        }}
                      >
                        <motion.div
                          variants={fadeInVariants5}
                          initial="initial"
                          whileInView="animate"
                          viewport={{
                            once: true,
                          }}
                          custom={15}
                          className="w-full min-h-[195px] sss:h-[215px] transition duration-200 ease-in-out rounded-lg p-4 hover:bg-[#6ee7b7] bg-[#6ee7b7]/90 flex gap-6 flex-col items-center justify-center"
                        >
                          <ChatIcon
                            className="w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                            color="#047857"
                          />
                          <p className="uppercase text-[#047857] text-xs lg:text-base font-semibold text-center">
                            AI Assistant
                          </p>
                        </motion.div>
                      </button>
                      {/* Admin Panel Link - Only visible to admin */}
                      {(studentDetails?.email === "patronkwo@gmail.com" || studentDetails?.email?.includes("admin")) && (
                        <NavLink to="/admin">
                          <motion.div
                            variants={fadeInVariants5}
                            initial="initial"
                            whileInView="animate"
                            viewport={{
                              once: true,
                            }}
                            custom={17}
                            className="w-full min-h-[195px] sss:h-[215px] transition duration-200 ease-in-out rounded-lg p-4 hover:bg-[#fca5a5] bg-[#fca5a5]/90 flex gap-6 flex-col items-center justify-center"
                          >
                            <svg
                              className="w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] mmd:h-16 mmd:w-16 xl:w-20 xl:h-20"
                              fill="#dc2626"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                            </svg>
                            <p className="uppercase text-[#dc2626] text-xs lg:text-base font-semibold text-center">
                              Admin Panel
                            </p>
                          </motion.div>
                        </NavLink>
                      )}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 mmd:gap-4">
                    {/* Recent Activities Section */}
                    <motion.div
                      variants={fadeInVariants5}
                      initial="initial"
                      whileInView="animate"
                      viewport={{
                        once: true,
                      }}
                      custom={11}
                      className="shadow rounded-lg w-full py-2 bg-white h-[340px] flex flex-col"
                    >
                      <div className="text-sm sm:text-xs md:text-base p-2 border-b border-gray-300 font-bold text-gray-800 flex items-center justify-between">
                        <span>Recent Activities</span>
                        <span className="text-xs font-normal text-gray-500">{activities.length} items</span>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {activities.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {activities.map((activity) => (
                              <div
                                key={activity.id}
                                onClick={() => activity.link && navigate(activity.link)}
                                className={`p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${activity.link ? 'cursor-pointer' : ''}`}
                              >
                                {getActivityIcon(activity.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                    {activity.title}
                                  </p>
                                  <p className="text-xss sm:text-xs text-gray-500 truncate">
                                    {activity.description}
                                  </p>
                                </div>
                                <span className="text-xss text-gray-400 whitespace-nowrap">
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
                      className="shadow rounded-lg w-full py-2 bg-white h-[340px] flex flex-col"
                    >
                      <div className="text-sm sm:text-xs md:text-base p-2 border-b border-gray-300 font-bold text-gray-800 flex items-center justify-between">
                        <span>Notifications</span>
                        {notifications.filter(n => !n.read).length > 0 && (
                          <span className="bg-red-500 text-white text-xss px-2 py-0.5 rounded-full">
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
                                  className={`p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                >
                                  <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                                    <svg className={`w-4 h-4 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.icon} />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs sm:text-sm font-medium text-gray-900 truncate ${!notification.read ? 'font-semibold' : ''}`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-xss sm:text-xs text-gray-500 line-clamp-2">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-xss text-gray-400 whitespace-nowrap">
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
