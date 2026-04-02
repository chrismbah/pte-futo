/* eslint-disable react-hooks/exhaustive-deps */
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import Lottie from "lottie-react";
import avatar from "../../../json/animation/avatar1.json";
import { CalenderIcon } from "../../../components/icons/general/CalenderIcon";
import { EmailIcon } from "../../../components/icons/socials/EmailIcon";
import { GraduateCapIcon } from "../../../components/icons/general/GraduateCapIcon";
import { ClockIcon } from "../../../components/icons/general/ClockIcon";
import { RegisterIcon } from "../../../components/icons/general/RegisterIcon";
import { useModalContext } from "../../../context/Modal";
import { Spinner } from "../../../components/loaders/Spinner";
import { BadNetworkIcon } from "../../../components/icons/general/BadNetworkIcon";
import { EditProfileModal } from "../../../components/modal/EditProfileModal";

export default function StudentProfile() {
  const { studentDetails, gettingStudentDetails, gettingStudentDetailsErr } =
    useGetUserInfo();
  const {
    setOpenEditProfileModal,
    setOpenSignOutModal,
  } = useModalContext();

  return (
    <div className="bg-white min-h-screen">
      <div className="box-width">
        {studentDetails ? (
          <div className="px-3 sm:px-10 md:px-16 xsm:py-[110px] py-[85px]">
            <div className="w-full flex items-center justify-between flex-col xsm:flex-row">
              <div className="flex flex-col xss:flex-row items-center gap-3 w-full xss:basis-2/3 ">
                {studentDetails?.profileImageURL ? (
                  <div className="w-[130px] h-[130px] xss:w-[150px] xss:h-[150px] sm:w-[180px] sm:h-[180px] mmd:w-[200px] mmd:h-[200px] rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <img 
                      src={studentDetails.profileImageURL} 
                      alt={`${studentDetails.firstName}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Lottie
                    animationData={avatar}
                    loop={false}
                    className="w-[130px] xss:w-[150px] sm:w-[180px] mmd:w-[200px]"
                  />
                )}
                <div className="flex flex-col justify-center xss:justify-start xsm:w-full ">
                  <p className="text-xl ss:text-2xl xsm:text-3xl font-bold text-center xss:text-left break-all max-w-full">
                    {studentDetails?.firstName} {studentDetails?.lastName}
                  </p>
                  <p className="text-gray-900 text-sm sm:text-xs xsm:text-base md:text-md font-semibold capitalize  text-center xss:text-left">
                    Status:{" "}
                    {studentDetails?.level == "Aspirant"
                      ? "Aspirant"
                      : studentDetails?.level === "Visitor"
                        ? "Visitor"
                        : "Student"}
                  </p>
                  <div className="flex items-center justify-center xss:justify-start gap-1 sm:gap-2 sm:mt-2">
                    <div className="rounded-lg bg-gray-200 p-1 sm:p-2">
                      <CalenderIcon className="w-3 sm:w-5" />
                    </div>
                    <p className="text-ss xsm:text-sm mmd:text-xs text-gray-700 font-[500] capitalize">
                      Joined {studentDetails?.registeredDate}
                    </p>
                  </div>
                </div>
              </div>
              <div className="xss:basis-1/3 flex items-center justify-center mt-2 xsm:mt-0 xss:justify-start xsm:justify-end gap-4 w-full xsm:w-full">
                <div className="flex items-center">
                  <button
                    onClick={() => setOpenEditProfileModal(true)}
                    className="p-1.5 xss:p-2 sm:p-3 rounded-lg bg-green1 text-xss xss:text-ss sm:text-sm font-semibold text-white border-2 border-transparent hover:bg-transparent hover:border-green1 transition duration-200 ease-in-out hover:text-black"
                  >
                    Edit Profile
                  </button>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => setOpenSignOutModal(true)}
                    className="p-1.5 xss:p-2 sm:p-3 rounded-lg bg-red-500 text-xss xss:text-ss sm:text-sm font-semibold text-white border-2 border-transparent hover:bg-transparent hover:border-red-500 transition duration-200 ease-in-out hover:text-red-500"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
            <div className=" mt-5">
              <h1 className="text-xs xsm:text-base  mmd:text-md text-gray-800 font-bold mb-2 sm:mb-3">
                Contact Information
              </h1>
              <div className="flex items-center gap-2 sm:gap-4 ">
                <div className="rounded-lg bg-gray-200 p-2">
                  <EmailIcon className="w-5 sm:w-8" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-ss sm:text-sm mmd:text-xs font-semibold text-left w-full">
                    Email
                  </p>
                  <p className="text-ss sm:text-sm mmd:text-xs font-[500] text-gray-600 break-all">
                    {studentDetails?.email}
                  </p>
                </div>
              </div>{" "}
              <h1 className="text-xs xsm:text-base  mmd:text-md text-gray-800 font-bold mb-2 sm:mb-3 mt-6 sm:mt-9">
                Academic Information
              </h1>
              <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-5">
                <div className="rounded-lg bg-gray-200 p-2">
                  <GraduateCapIcon className="w-5 sm:w-8" />
                </div>
                <div className="flex flex-col">
                  <p className="text-ss sm:text-sm mmd:text-xs font-semibold text-left w-full">
                    Department
                  </p>
                  <p className="text-ss sm:text-sm mmd:text-xs font-[500] text-gray-600">
                    Medicine and Surgery 
                  </p>
                </div>
              </div>{" "}
              <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-5">
                <div className="rounded-lg bg-gray-200 p-2">
                  <ClockIcon className="w-5 sm:w-8" />
                </div>
                <div className="flex flex-col">
                  <p className="text-ss sm:text-sm mmd:text-xs font-semibold text-left w-full">
                    Level
                  </p>
                  <p className="text-ss sm:text-sm mmd:text-xs font-[500] text-gray-600 text-left">
                    {studentDetails?.level === "Visitor" ||
                    studentDetails?.level === "Aspirant"
                      ? "None"
                      : studentDetails?.level}
                  </p>
                </div>
              </div>{" "}
              <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-5">
                <div className="rounded-lg bg-gray-200 p-2">
                  <RegisterIcon className="w-5 sm:w-8 fill-green1" />
                </div>
                <div className="flex flex-col">
                  <p className="text-ss sm:text-sm mmd:text-xs font-semibold text-left w-full">
                    Matriculation Number
                  </p>
                  <p className="text-ss sm:text-sm mmd:text-xs font-[500] text-gray-600 text-left">
                    {studentDetails?.regNo || "None"}
                  </p>
                </div>
              </div>{" "}
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
              <BadNetworkIcon className="w-6 sm:w-10 md:w-16" />
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
      </div>
      <EditProfileModal />
    </div>
  );
}
