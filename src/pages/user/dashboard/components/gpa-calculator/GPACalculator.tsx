import { GPAMessage } from "../../../../academics/gpa/components/GPAMessage";
import { useComputeGPA } from "../../../../academics/gpa/hooks/useComputeGPA";
import GPAForm from "../../../../academics/gpa/components/GPAForm";
import { motion } from "framer-motion";
import { fadeInVariants1 } from "../../../../../animation/variants";
import { useGetUserInfo } from "../../../../../hooks/auth/useGetUserInfo";
import avatar from "../../../../../json/animation/avatar1.json";
import Lottie from "lottie-react";
export default function GPACalculator() {
  const { studentGPA } = useComputeGPA();
  const { studentDetails } = useGetUserInfo();
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="  w-full min-h-[95vh] flex items-center justify-center px-3 sm:px-10 py-10 pt-20 sm:pt-28">
        <motion.div
          variants={fadeInVariants1}
          initial="initial"
          whileInView="animate"
          viewport={{
            once: true,
          }}
          className="relative bg-white p-5 sm:p-8 shadow rounded-lg max-w-[700px] "
        >
          <div className="flex justify-between items-center mb-2 flex-col xxss:flex-row xxss:gap-2 mt-4 sm:mt-2">
            <h3 className=" w-full xxss:w-fit flex items-center justify-start font-semibold text-md sm:text-xl md:text-2xl">
              GPA Calculator
            </h3>
            <div className="w-full xxss:w-fit">
              {" "}
              <div className=" flex items-center justify-start xxss:justify-center gap-1.5">
                {studentDetails && studentDetails.profileImageURL ? (
                  <img
                    src={studentDetails.profileImageURL}
                    alt="You"
                    className="h-5 w-5 sm:h-7 sm:w-7 rounded-full object-cover "
                  />
                ) : (
                  <Lottie
                    animationData={avatar}
                    loop={false}
                    className="h-5 w-5 sm:h-7 sm:w-7 "
                  />
                )}

                <span className="text-green1 text-xs sm:text-md font-semibold w-fit text-left">
                  :{studentGPA >= 0 ? studentGPA : "0.00"}
                </span>
              </div>{" "}
              <GPAMessage />
            </div>
          </div>
          <p className="mb-4 text-ss sm:text-sm md:text-xs font-medium">
            Track your progress, strategize your efforts, and conquer your
            coursework.{" "}
          </p>
          <div>
            <GPAForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
