/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Dropdown } from "flowbite-react";
import { customDropdownTheme } from "../../themes/customDropdown";
import { NavLink, Link } from "react-router-dom";
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
import { useState, useEffect } from "react";
import { BurgerIcon } from "../icons/nav/BurgerIcon";
import { motion } from "framer-motion";
import { fadeInVariants4 } from "../../animation/variants";

export const GeneralNavbar = () => {
  const { studentDetails, user, loading } = useGetUserInfo();
  const firstName = studentDetails?.firstName;
  const lastName = studentDetails?.lastName;
  const email = studentDetails?.email;

  const { setOpenSignOutModal } = useModalContext();
  const [isNavOpen, setIsNavOpen] = useState(false);
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
      <nav className="w-full fixed top-0 left-0 px-2 py-4 xsm:p-4 bg-white shadow-sm z-10">
        <div className="max-w-[1520px] w-full mx-auto">
          <div className="flex items-center flex-between flex-wrap">
            <div className="flex items-center justify-start">
              <button
                onClick={toggleMenu}
                className="focus:outline-none bg-transparent mr-2 xsm:hidden"
              >
                <BurgerIcon className="w-6 h-6" />
              </button>

              <a href="/">
                <div className="logo flex xsss:pr-4 sm:pr-8 z-[999]">
                  <img
                    src={logo}
                    className="mr-2 w-8 h-8 ss:w-10 ss:h-10 sm:w-12 sm:h-12"
                    alt="Medsurg Logo"
                  />
                  <div className="mr-2 text-black w-[100%] sm:w-[70%] self-center whitespace-wrap text-xss ss:text-ss lg:text-sm font-[900]">
                    Medicine and Surgery <br /> Department, EBSU
                  </div>
                </div>
              </a>

              <div
                className={`inline-nav border-l-2 border-gray-500 items-center gap-2 hidden xsm:flex ${isNavOpen && "xsm:hidden"}`}
              >
                <NavLink
                  to={"/"}
                  className="pt-[3px] text-sm md:text-xs hover:text-green1 ml-2 font-semibold text-gray-700 px-2 "
                >
                  <motion.p
                    variants={fadeInVariants4}
                    initial="initial"
                    whileInView="animate"
                    viewport={{
                      once: true,
                    }}
                    custom={1}
                  >
                    Home
                  </motion.p>
                </NavLink>
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <motion.p
                      variants={fadeInVariants4}
                      initial="initial"
                      whileInView="animate"
                      viewport={{
                        once: true,
                      }}
                      custom={3}
                      className="pt-1 md:pt-0.5 text-sm md:text-xs hover:text-green1 ml-0 font-semibold text-gray-700 px-2"
                    >
                      About
                    </motion.p>
                  }
                  theme={customDropdownTheme}
                >
                  <NavLink to={"/about/about-us"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        About Us
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink to={"/about/philosophy-and-objectives"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        Philosophy and Objectives
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink to={"/about/admission"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        Admission
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                </Dropdown>
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <motion.p
                      variants={fadeInVariants4}
                      initial="initial"
                      whileInView="animate"
                      viewport={{
                        once: true,
                      }}
                      custom={5}
                      className="pt-1 md:pt-0.5 text-sm md:text-xs hover:text-green1 ml-0 font-semibold text-gray-700 px-2"
                    >
                      Academics
                    </motion.p>
                  }
                  theme={customDropdownTheme}
                >
                  <NavLink to={"/calculate-gpa"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        GPA Calculator
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink to={"/learning-resources"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        Learning Resources
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink to={"/course-outlines"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        Course Outlines
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                </Dropdown>
                
                {/* EBSUMSA Dropdown */}
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <motion.p
                      variants={fadeInVariants4}
                      initial="initial"
                      whileInView="animate"
                      viewport={{
                        once: true,
                      }}
                      custom={6}
                      className="pt-1 md:pt-0.5 text-sm md:text-xs hover:text-green1 ml-0 font-semibold text-gray-700 px-2"
                    >
                      EBSUMSA
                    </motion.p>
                  }
                  theme={customDropdownTheme}
                >
                  <NavLink to={"/ebsumsa/team"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        Executive Team
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink to={"/ebsumsa/sports"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        Sports Team
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink to={"/ebsumsa/press"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        Press Team
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                </Dropdown>

                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <motion.p
                      variants={fadeInVariants4}
                      initial="initial"
                      whileInView="animate"
                      viewport={{
                        once: true,
                      }}
                      custom={7}
                      className="pt-1 md:pt-0.5 text-sm md:text-xs hover:text-green1 font-semibold text-gray-700"
                    >
                      Students
                    </motion.p>
                  }
                  theme={customDropdownTheme}
                >
                  <NavLink to={"/students/class-representatives"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        Class Representatives
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink to={"/students/project-team"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        Project Team
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink to={"/projects"}>
                    <Dropdown.Item className="group">
                      <p className="group-hover:text-green1 text-ss md:text-sm font-semibold text-gray-700">
                        Projects Showcase
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                </Dropdown>
                <NavLink
                  to={"/blog"}
                  className=" text-sm md:text-xs hover:text-green1 font-semibold text-gray-700 px-2 pt-1 md:pt-[3px]"
                >
                  <motion.p
                    variants={fadeInVariants4}
                    initial="initial"
                    whileInView="animate"
                    viewport={{
                      once: true,
                    }}
                    custom={9}
                  >
                    Blog
                  </motion.p>
                </NavLink>
              </div>
            </div>
            <div
              onClick={toggleMenu}
              className={`fixed top-0 left-0 w-full h-screen bg-black/50 backdrop-blur-sm transition duration-300 transform ${isNavOpen ? "block" : "hidden opacity-0"} z-[3]  `}
            ></div>

            <div
              className={`dashboard-links pl-4 pr-2 py-4 sm:pl-6 sm:pr-4 fixed top-0 left-0 w-[240px] sm:w-[270px] h-screen bg-white shadow z-[6] transition duration-300 ease-in-out transform ${
                isNavOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="mobile-nav flex items-center justfiy-start gap-2 mb-6">
                <button
                  onClick={toggleMenu}
                  className="focus:outline-none bg-transparent"
                >
                  <BurgerIcon className="w-6 h-6" />
                </button>
                <div className="">
                  <a href="/">
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
                  </a>
                </div>
              </div>
              <div className="mb-4">
                <p className="font-bold text-gray-700 uppercase text-ss xss:text-sm sm:text-xs">
                  Links
                </p>
              </div>
              <div className="w-full flex flex-col justify-start gap-2 text-ss xss:text-sm sm:text-xs font-bold text-gray-700 max-h-[calc(100vh-150px)] overflow-y-auto">
                <NavLink
                  onClick={() => setIsNavOpen(false)}
                  to={"/"}
                  className="w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition"
                >
                  Home
                </NavLink>
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <p className="w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition text-left">
                      About
                    </p>
                  }
                  theme={customDropdownTheme}
                >
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/about/about-us"}
                  >
                    <Dropdown.Item>
                      <p className="rounded-md hover:bg-gray-100 w-full text-left hover:text-green1  ">
                        About Us
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/about/philosophy-and-objectives"}
                  >
                    <Dropdown.Item>
                      <p className=" rounded-md hover:bg-gray-100 w-full text-left hover:text-green1 ">
                        Philosophy and Objectives
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/about/admission"}
                  >
                    <Dropdown.Item>
                      <p className="rounded-md hover:bg-gray-100 w-full text-left hover:text-green1  ">
                        Admission
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                </Dropdown>

                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <p className="w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition text-left">
                      Academics
                    </p>
                  }
                  theme={customDropdownTheme}
                >
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/calculate-gpa"}
                  >
                    <Dropdown.Item>
                      <p className=" rounded-md hover:bg-gray-100 w-full text-left hover:text-green1 ">
                        GPA Calculator
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/learning-resources"}
                  >
                    <Dropdown.Item>
                      <p className="rounded-md hover:bg-gray-100 w-full text-left hover:text-green1  ">
                        Learning Resources
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/course-outlines"}
                  >
                    <Dropdown.Item>
                      <p className="rounded-md hover:bg-gray-100 w-full text-left hover:text-green1  ">
                        Course Outlines
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                </Dropdown>

                {/* Mobile EBSUMSA Dropdown */}
                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <p className="w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition text-left">
                      EBSUMSA
                    </p>
                  }
                  theme={customDropdownTheme}
                >
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/ebsumsa/team"}
                  >
                    <Dropdown.Item>
                      <p className="rounded-md hover:bg-gray-100 w-full text-left hover:text-green1">
                        Executive Team
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/ebsumsa/sports"}
                  >
                    <Dropdown.Item>
                      <p className="rounded-md hover:bg-gray-100 w-full text-left hover:text-green1">
                        Sports Team
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/ebsumsa/press"}
                  >
                    <Dropdown.Item>
                      <p className="rounded-md hover:bg-gray-100 w-full text-left hover:text-green1">
                        Press Team
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                </Dropdown>

                <Dropdown
                  arrowIcon={false}
                  inline
                  label={
                    <p className="w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition text-left ">
                      Students
                    </p>
                  }
                  theme={customDropdownTheme}
                >
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/students/class-representatives"}
                  >
                    <Dropdown.Item>
                      <p className="rounded-md hover:bg-gray-100 w-full text-left hover:text-green1  ">
                        Class Representatives
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/students/project-team"}
                  >
                    <Dropdown.Item>
                      <p className="rounded-md hover:bg-gray-100 w-full text-left hover:text-green1 ">
                        Project Team
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                  <NavLink
                    onClick={() => setIsNavOpen(false)}
                    to={"/projects"}
                  >
                    <Dropdown.Item>
                      <p className="rounded-md hover:bg-gray-100 w-full text-left hover:text-green1 ">
                        Projects Showcase
                      </p>
                    </Dropdown.Item>
                  </NavLink>
                </Dropdown>

                <NavLink
                  onClick={() => setIsNavOpen(false)}
                  to={"/blog"}
                  className="w-full p-3 hover:text-green1 hover:bg-gray-100 rounded-md transition "
                >
                  Blog
                </NavLink>
              </div>
            </div>
            <motion.div
              variants={fadeInVariants4}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              custom={11}
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
                    className="z-[999]"
                    theme={customDropdownTheme}
                    label={
                      <>
                        {studentDetails &&
                        studentDetails.profileImageURL.length > 0 ? (
                          <div
                            className="h-[32px] w-[32px] sm:h-[34px] sm:w-[34px] md:h-[38px] md:w-[38px] bg-gray-200
                            rounded-full border sm:border-[3px] border-gray-300 hover:border-green4 transition duration-200 ease-in-out"
                          >
                            <img
                              src={studentDetails.profileImageURL}
                              alt="Profile"
                              onLoad={() => console.log("Loaded")}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          studentDetails &&
                          studentDetails.profileImageURL.length < 1 && (
                            <div>
                              <Lottie
                                animationData={avatar}
                                loop={false}
                                className="h-[32px] w-[32px] md:h-[34px] md:w-[34px]"
                              />
                            </div>
                          )
                        )}
                      </>
                    }
                  >
                    <Dropdown.Header>
                      <span className="block text-sm sm:text-xs font-bold text-gray-700">
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
                        <SignOutIcon className="w-5 group-hover:scale-110 transition duration-200 ease-in-out " />{" "}
                        <span className="text-ss sm:text-sm font-medium text-gray-700 group-hover:font-bold group-hover:text-red-500">
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
                  <button className="bg-green2 hover:bg-green1 text-white text-xss ss:text-ss md:text-xs font-semibold px-3 py-2 md:px-4 md:py-2 rounded-lg transition duration-200 ease-in-out">
                    Login
                  </button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </nav>
      <SignOutModal />
    </>
  );
};
