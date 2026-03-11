/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "flowbite-react";
import { customButtonTheme } from "../../themes/customButtton";
import { Link } from "react-router-dom";
import heroAnimation from "../../json/animation/read.json";
import Lottie from "lottie-react";
import { useGetUserInfo } from "../../hooks/auth/useGetUserInfo";
import { motion } from "framer-motion";
import { fadeInVariants3 } from "../../animation/variants";

export default function Hero() {
  const { user, studentDetails } = useGetUserInfo();
  return (
    <div className="home-gray-bg">
      <div className="px-3 xsm:px-14 sm:pt-24 mmd:pt-28 sm:pb-36 pt-20 pb-32 box-width">
        <div className="section-flex-between gap-4">
          <div className="w-full">
            <motion.h1
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              custom={1}
              className="text-green1 text-3xl sm:text-4xl mmd:text-5xl lg:text-4xl xl:text-5xl font-[700]"
            >
              Medicine and Surgery Department
            </motion.h1>
            <motion.h2
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              custom={3}
              className="mb-2 xl:text-4xl lg:text-3xl sm:text-2xl text-xl font-semibold text-gray-800"
            >
              Ebonyi State University, Abakaliki
            </motion.h2>
            <motion.p
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              custom={5}
              className="text-ss ss:text-sm md:text-xs text-gray-700 font-medium mb-4"
            >
              Dive into comprehensive course outlines and get instant access to learning materials, previous exam questions and handouts tailored for medical students. <br className="hidden ss:block" /> Track
              your academic progress with our GPA calculator, stay up to date with
              the latest news and articles <br className="hidden ss:block" />{" "}
              and become part of an active, supportive community of fellow medical learners.
            </motion.p>
            <motion.div
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              custom={6}
              className="w-full flex items-center mt-6"
            >
              <Link to={user && studentDetails ? "/dashboard" : "/signup"}>
                <Button theme={customButtonTheme} size={"lg"} color="primary">
                  {user && studentDetails ? "Go to Dashboard" : "Get Started"}
                </Button>
              </Link>
            </motion.div>
         </div>
          <div className="max-w-[500px] mmd:max-w-[700px] xlg:w-[800px]">
            <Lottie loop={false} animationData={heroAnimation} />
          </div>
        </div>
      </div>
    </div>
  );
}
