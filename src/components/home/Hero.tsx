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
              Access a comprehensive collection of course outlines, past exam questions, handouts, and learning materials curated specifically for medical students. Stay informed with the latest news and articles, and join a vibrant, supportive community of peers dedicated to academic excellence.
            </motion.p>
            <motion.div
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              custom={6}
              className="w-full flex items-center gap-3 mt-6 flex-wrap"
            >
              <Link to={user && studentDetails ? "/dashboard" : "/signup"}>
                <Button theme={customButtonTheme} size={"lg"} color="primary">
                  {user && studentDetails ? "Go to Dashboard" : "Get Started"}
                </Button>
              </Link>
              <Link
                to={user ? "/u/wallet" : "/login"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-[#00875a] text-[#00875a] font-semibold text-sm hover:bg-[#00875a] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay Now
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
