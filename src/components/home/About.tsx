import Lottie from "lottie-react";
import consultation from "../../json/animation/consultation.json";
import glasses from "../../json/animation/glasses.json";
import img2 from "../../assets/img/gallery/fetha.jpg";
import img3 from "../../assets/img/gallery/ebsu.jpeg";
import img4 from "../../assets/img/gallery/senate.png";
import { motion } from "framer-motion";
import {
  fadeInVariants1,
  fadeInVariants2,
  fadeInVariants3,
} from "../../animation/variants";

export default function About() {
  return (
    <>
      <div className="box-width">
        <div className="section flex items-center justify-between flex-col mmd:flex-row gap-6 py-10">
          <div className="w-full mmd:basis-2/5">
            <motion.h2
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              custom={1}
            >
              <div className="bar-style" />
              About Us
            </motion.h2>
              <motion.p
                variants={fadeInVariants3}
                initial="initial"
                whileInView="animate"
                viewport={{
                  once: true,
                }}
                custom={2}
                className="text-gray-900 font-medium text-ss ss:text-sm xlg:text-xs mb-4"
              >
                EBSUMSA is dedicated to advancing academic excellence, professional development, and community health among medical students at Ebonyi State University through innovative programs and collaborative partnerships.
              </motion.p>
            <motion.div
              variants={fadeInVariants1}
              initial="initial"
              whileInView="animate"
              custom={1}
              viewport={{
                once: true,
              }}
              className="bg-white shadow-4 rounded-lg p-6 flex items-center mb-4 justify-start gap-3"
            >
              <Lottie
                loop={true}
                animationData={glasses}
                className="w-[50px] ss:w-[70px] mmd:w-[90px]"
              />
              <div>
                <h4 className="text-green1 font-bold text-xs">Our Vision</h4>
                <p className="text-gray-700 font-medium text-xss sm:text-sm mmd:text-ss xlg:text-sm">
                  Medical students of EBSU positioned as leaders on the global healthcare landscape through excellence and compassion.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={fadeInVariants1}
              initial="initial"
              whileInView="animate"
              custom={3}
              viewport={{
                once: true,
              }}
              className="bg-white shadow-4 basis-2/5 rounded-lg p-6 flex items-center justify-start gap-3"
            >
              <Lottie
                loop={true}
                animationData={consultation}
                className="w-[50px] ss:w-[70px] mmd:w-[90px]"
              />
              <div>
                <h4 className="text-green1 font-bold text-xs">Our Mission</h4>
                <p className="text-gray-700 font-medium text-xss sm:text-sm mmd:text-ss xlg:text-sm">
                  Advancing medical education through clinical skills, research, public health outreach, and connecting students with professional opportunities.
                </p>
              </div>
            </motion.div>
          </div>
          <div className="mmd:basis-3/5">
            <div className="flex gap-1 sm:gap-3">
              <div className="basis-1/2 flex items-center justify-center flex-col">
                <div className="basis-2/3">
                  <motion.div
                    variants={fadeInVariants2}
                    viewport={{
                      once: true,
                    }}
                    initial="initial"
                    whileInView="animate"
                    custom={1}
                    className="relative"
                  >
                    <img
                      src={img2}
                      alt=""
                      className="h-[50%] bg-gray-100 w-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-green4/30 rounded-lg"></div>
                  </motion.div>
                </div>
              </div>
              <div className="basis-1/2 flex items-start flex-col gap-1 sm:gap-3">
                <div className="basis-2/5">
                  <motion.div
                    variants={fadeInVariants2}
                    viewport={{
                      once: true,
                    }}
                    initial="initial"
                    whileInView="animate"
                    custom={3}
                    className="relative"
                  >
                    <img
                      src={img4}
                      alt=""
                      className="h-[50%] bg-gray-200 w-full sm:w-[80%] object-cover rounded-lg "
                    />
                    <div className="absolute w-full sm:w-[80%] inset-0 bg-gradient-to-b from-transparent via-transparent to-green4/30 rounded-lg"></div>
                  </motion.div>
                </div>
                <div className="basis-3/5">
                  <motion.div
                    variants={fadeInVariants2}
                    viewport={{
                      once: true,
                    }}
                    initial="initial"
                    whileInView="animate"
                    custom={4}
                    className="relative"
                  >
                    <img
                      src={img3}
                      alt=""
                      className="h-[50%] bg-gray-200 w-full sm:w-[80%] object-cover rounded-lg "
                    />
                    <div className="absolute w-full sm:w-[80%] inset-0 bg-gradient-to-b from-transparent via-transparent to-green4/30 rounded-lg"></div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
