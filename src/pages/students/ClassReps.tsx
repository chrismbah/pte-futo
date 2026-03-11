import { useEffect } from "react";
import { fadeInVariants3 } from "../../animation/variants";
import Footer from "../../components/footer/Footer";
import { classReps } from "../../data/students/classReps";
import { motion } from "framer-motion";
import { GraduateCapIcon } from "../../components/icons/general/GraduateCapIcon";
import { RegisterIcon } from "../../components/icons/general/RegisterIcon";
import { SuitcaseIcon } from "../../components/icons/general/SuitcaseIcon";
import { ProfileIcon } from "../../components/icons/general/ProfileIcon";

export default function ClassReps() {
  useEffect(() => {
    window.scroll(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <div className="box-width">
        <div className="px-3 py-20 sm:px-10 xl:px-20 sm:py-24">
          <div className="flex items-center justify-center flex-col mb-4">
            <h2>
              <div className="bar-style" />
              Class Representatives
            </h2>
            <h3 className="text-gray-700 font-[500] text-ss ss:text-sm xlg:text-xs capitalize">
              Our esteemed student representatives across all levels
            </h3>
          </div>
          <div className="grid sss:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-8 ">
            {classReps.map(({ img, name, regNo, title, work }, i) => (
              <motion.div
                variants={fadeInVariants3}
                initial="initial"
                whileInView="animate"
                viewport={{
                  once: true,
                }}
                custom={i}
                key={i}
                className="w-full h-[400px] sss:h-[420px] shadow-4 transition-shadow duration-200 ease-in-out rounded-lg overflow-hidden bg-white"
              >
                <img
                  src={img}
                  alt={name}
                  className="w-full h-2/3 object-cover"
                />
                <div className="h-1/3 p-3 flex flex-col justify-between">
                  <p className="font-bold text-sm md:text-xs uppercase flex gap-1.5 items-center text-gray-900">
                    <ProfileIcon className="w-6 h-6" /> {name}
                  </p>
                  <p className="font-semibold text-ss flex gap-1.5 items-center text-gray-900">
                    <RegisterIcon className="w-6 h-6 fill-green1" /> {regNo}
                  </p>
                  <p className="font-semibold text-ss uppercase flex gap-1.5 items-center text-gray-900">
                    <GraduateCapIcon className="w-6 h-6 fill-green1" /> {title}
                  </p>
                  <p className="font-semibold text-ss uppercase flex gap-1.5 items-center text-gray-900">
                    <SuitcaseIcon className="w-6 h-6" /> {work}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
