/* eslint-disable react-hooks/exhaustive-deps */
import { Dropdown } from "flowbite-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo/logo.png";
import { useGetUserInfo } from "../../hooks/auth/useGetUserInfo";
import { useModalContext } from "../../context/Modal";
import { SignOutModal } from "../modal/SignOutModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Lottie from "lottie-react";
import avatar from "../../json/animation/avatar1.json";
import { SignOutIcon } from "../icons/nav/SignOutIcon";
import { DashboardIcon } from "../icons/nav/DashboardIcon";
import { ProfileIcon } from "../icons/nav/ProfileIcon";
import { useEffect, useState } from "react";
import { BurgerIcon } from "../icons/nav/BurgerIcon";
import { NavLink } from "react-router-dom";
import { NotificationDropdown } from "../notifications/NotificationDropdown";
import { fadeInVariants4 } from "../../animation/variants";
import { motion } from "framer-motion";
import { useLoadImage } from "../../hooks/user-profile/useLoadImage";

export const DashboardNavbar = () => {
  const { studentDetails, user, loading } = useGetUserInfo();
  const firstName = studentDetails?.firstName;
  const lastName = studentDetails?.lastName;
  const email = studentDetails?.email;

  const { setOpenSignOutModal } = useModalContext();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { isImageLoading, setIsImageLoading, LoadingPlaceholder } = useLoadImage()
  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
  }, [isNavOpen]);

  const toggleMenu = () => setIsNavOpen(!isNavOpen);

  return (
    <>
      <nav className="dashboard w-full fixed top-0 left-0 px-2 py-4 xsm:p-4 bg-white shadow-sm z-50">
        <div className="max-w-[1720px] w-full mx-auto">
          <div className="flex items-center flex-between flex-wrap">
            <div className="flex items-center justify-start">
              <button
                onClick={toggleMenu}
                className="focus:outline-none bg-transparent mr-2"
              >
                <BurgerIcon className="w-6 h-6" />
              </button>

              <a href="/">
                <div className="logo flex xsss:pr-4 sm:pr-8 z-[109990]">
                  <img
                    src={logo}
                    className="mr-2 w-8 h-8 ss:w-10 ss:h-10 sm:w-12 sm:h-12"
                    alt="PTE Logo"
                  />
                  <div className="mr-2 text-black w-[100%] hidden xsss:block sm:block sm:w-[70%] self-center whitespace-wrap text-xss ss:text-ss lg:text-sm font-[900]">
                    Medicine and Surgery <br /> Department, EBSU
                  </div>
                </div>
              </a>

              <div className="border-l-2 border-gray-500">
                <motion.p
                  variants={fadeInVariants4}
                  initial="initial"
                  whileInView="animate"
                  viewport={{
                    once: true,
                  }}
                  custom={1}
                  className=" text-ss sm:text-xs ml-2 font-semibold text-black"
                >
                  Dashboard
                </motion.p>
              </div>
            </div>
            <div
              onClick={toggleMenu}
              className={`fixed top-0 left-0 w-full h-screen bg-black/50 backdrop-blur-sm transition duration-500 transform ${isNavOpen ? "block" : "hidden opacity-0"} z-[3]  `}
            ></div>
            <div
              className={`dashboard-links px-2 py-4 sm:p-4 fixed top-0 left-0 w-[240px] sm:w-[270px] h-screen bg-white shadow z-[6] transition duration-300 ease-in-out transform ${
                isNavOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex items-center justfiy-start gap-2 mb-6">
                <button
                  onClick={toggleMenu}
                  className="focus:outline-none bg-transparent"
                >
                  <BurgerIcon className="w-6 h-6 mr-1" />
                </button>
                <div className="">
                  <div className="logo flex">
                    <img
                      src={logo}
                      className="mr-2 w-8 h-8 ss:w-10 ss:h-10"
                      alt="PTE Logo"
                    />
                    <div className="mr-2 text-black w-[100%] sm:w-[70%] self-center whitespace-wrap text-xss ss:text-ss lg:text-sm font-[900]">
                      Medicine and Surgery <br /> Department, EBSU
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <p className="font-bold text-gray-700 uppercase text-ss xss:text-sm sm:text-xs">
                  Modules
                </p>
              </div>
              <div className="flex flex-col justify-start gap-2 text-ss xss:text-sm sm:text-xs font-bold text-gray-700">
                <NavLink
                  onClick={() => setIsNavOpen(false)}
                  to="/"
                  className={
                    "w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition"
                  }
                >
                  Go Home
                </NavLink>{" "}
                <NavLink
                  onClick={() => setIsNavOpen(false)}
                  to="/dashboard"
                  className={
                    "w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition"
                  }
                >
                  Dashboard
                </NavLink>{" "}
                <NavLink
                  onClick={() => setIsNavOpen(false)}
                  to="/u/course-outlines"
                  className={
                    "w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition"
                  }
                >
                  Course Outlines
                </NavLink>
                <NavLink
                  onClick={() => setIsNavOpen(false)}
                  to="/u/learning-resources"
                  className={
                    "w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition"
                  }
                >
                  Learning Resources
                </NavLink>{" "}
                <NavLink
                  onClick={() => setIsNavOpen(false)}
                  to="/u/profile"
                  className={
                    "w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition"
                  }
                >
                  Profile
                </NavLink>
                {/* Admin Link - Only visible to admin users */}
                {(["patronkwo@gmail.com","kenronkwo@gmail.com","ebsumsapresident2526@gmail.com","ebsumsa102@gmail.com","oohveeyuu070@gmail.com"].includes((studentDetails?.email || '').toLowerCase()) || studentDetails?.email?.toLowerCase().includes("admin")) && (
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to="/admin"
                    className={
                      "w-full p-3 hover:text-red-600 hover:bg-red-50 rounded-md transition text-red-600 font-semibold flex items-center gap-2"
                    }
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                    </svg>
                    Admin Panel
                  </NavLink>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <motion.div
                variants={fadeInVariants4}
                initial="initial"
                whileInView="animate"
                viewport={{
                  once: true,
                }}
                custom={3}
              >
                <NotificationDropdown />
              </motion.div>
              <motion.div
                variants={fadeInVariants4}
                initial="initial"
                whileInView="animate"
                viewport={{
                  once: true,
                }}
                custom={5}
              >
                {loading ? (
                  <Skeleton
                    circle={true}
                    className="h-[34px] w-[34px] md:h-[36px] md:w-[36px]"
                  />
                ) : user ? (
                  studentDetails ? (
                    <Dropdown
                      arrowIcon={false}
                      inline
                      className="z-[9999]"
                      theme={{
                        floating: {
                          base: "z-10 w-fit divide-y divide-gray-100 rounded-lg shadow focus:outline-none",
                          content: "py-1 text-sm text-gray-700",
                          target: "w-fit",
                          style: {
                            auto: "border border-gray-200 bg-white text-gray-900",
                          },
                        },
                      }}
                      label={
                        <>
                          {studentDetails &&
                          studentDetails.profileImageURL.length > 0 ? (
                            <div
                              className="h-[30px] w-[30px] sm:h-[33px] sm:w-[33px] md:h-[38px] md:w-[38px] bg-gray-200
                             rounded-full border sm:border-[3px] border-gray-300 hover:border-green4 transition duration-200 ease-in-out"
                            >
                             { isImageLoading? <LoadingPlaceholder /> : <img
                                src={studentDetails.profileImageURL}
                                alt="Profile"
                                onLoad={() => setIsImageLoading(false)}
                                className="w-full h-full rounded-full object-cover"
                              />}
                            </div>
                          ) : (
                            studentDetails &&
                            studentDetails.profileImageURL.length < 1 && (
                              <Lottie
                                animationData={avatar}
                                loop={false}
                                className="h-[32px] w-[32px] md:h-[34px] md:w-[34px]"
                              />
                            )
                          )}
                        </>
                      }
                    >
                      <Dropdown.Header>
                        <span className="block text-sm sm:text-[14.6px] font-bold text-gray-700">
                          {studentDetails && firstName}{" "}
                          {studentDetails && lastName}
                        </span>
                        <span className="block truncate text-ss sm:text-sm text-gray-700 font-medium">
                          {studentDetails && email}
                        </span>
                      </Dropdown.Header>
                      <Link to={"/dashboard"}>
                        <Dropdown.Item className="group transition duration-200 ease-in-out">
                          <div className="flex items-center justify-start gap-1">
                            <DashboardIcon className="w-5 group-hover:scale-110 transition duration-200 ease-in-out " />{" "}
                            <span className="text-ss sm:text-sm font-medium text-gray-700 group-hover:font-bold">
                              Dashboard
                            </span>
                          </div>
                        </Dropdown.Item>
                      </Link>
                      <Link to="/u/profile">
                        <Dropdown.Item className="group transition duration-200 ease-in-out">
                          <div className="flex items-center justify-start gap-1">
                            <ProfileIcon className="w-5 group-hover:scale-110 transition duration-200 ease-in-out " />{" "}
                            <span className="text-ss sm:text-sm font-medium text-gray-700 group-hover:font-bold">
                              Profile
                            </span>
                          </div>{" "}
                        </Dropdown.Item>
                      </Link>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        onClick={() => setOpenSignOutModal(true)}
                        className="group transition duration-200 ease-in-out"
                      >
                        <div className="flex items-center justify-start gap-1">
                          <SignOutIcon className=" w-5 group-hover:scale-110 transition duration-200 ease-in-out " />{" "}
                          <span className="text-ss sm:text-sm font-medium text-gray-700 group-hover:font-bold">
                            Sign Out
                          </span>
                        </div>
                      </Dropdown.Item>
                    </Dropdown>
                  ) : (
                    <Skeleton
                      circle={true}
                      className="h-[34px] w-[34px] md:h-[36px] md:w-[36px]"
                    />
                  )
                ) : (
                  <Link to={"/login"}>
                    <button className="rounded-lg bg-green1 hover:bg-green1/95 transition duration-200 ease-in-out py-2 px-2.5 sm:px-3.5 font-semibold text-white text-sm sm:text-xs">
                      Login
                    </button>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </nav>
      <SignOutModal />
    </>
  );
};
