import { motion } from "framer-motion";
import { services } from "../../data/home/services";
import { Link } from "react-router-dom";
import { fadeInVariants1, fadeInVariants3 } from "../../animation/variants";

export default function Services() {
  return (
    <div className="home-gray-bg">
      <div className="box-width">
        <div className="px-3 xsm:px-14 xsm:py-10 xsm:pb-32 py-10">
          <div className="mmd:flex items-center justify-center flex-col capitalize mb-3">
            <motion.h2
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              custom={1}
            >
              {" "}
              <div className="bar-style" />
              What we offer
            </motion.h2>
            <motion.h3
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              custom={2}
              className="text-gray-700 font-medium text-ss ss:text-sm xlg:text-xs mb-3"
            >
              The services offered to students and non-students
            </motion.h3>
          </div>

          <div className="grid items-center sm:grid-cols-2 mmd:grid-cols-3 gap-5">
            {services.map(({ link, desc, icon, color, title }, index) => (
              <div key={index} className="w-full">
                {link ? (
                  <Link to={link} className="w-full">
                    <motion.div
                      variants={fadeInVariants1}
                      initial="initial"
                      whileInView="animate"
                      viewport={{
                        once: true,
                      }}
                      custom={index}
                      className="bg-white rounded-lg shadow-4 hover:shadow-md transition-shadow duration-250 ease-in-out p-12 h-[270px] sm:h-[300px] flex flex-col justify-center items-center"
                    >
                      <div
                        className={`${color === "dark-green" ? "bg-green1" : "bg-green5"} bg-green1 rounded-full p-3 mb-2`}
                      >
                        <img src={icon} alt={title} className="w-[25px]" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2 text-center text-base sm:text-md">
                        {title}
                      </h3>
                      <p className="text-gray-700 text-xss ss:text-ss sm:text-sm text-center font-medium">
                        {desc}
                      </p>
                    </motion.div>
                  </Link>
                ) : (
                  <motion.div
                    variants={fadeInVariants1}
                    initial="initial"
                    whileInView="animate"
                    viewport={{
                      once: true,
                    }}
                    custom={index}
                    className="bg-white rounded-lg shadow-4 hover:shadow-md transition-shadow duration-250 ease-in-out p-12 h-[270px] sm:h-[300px] flex flex-col justify-center items-center"
                  >
                    <div
                      className={`${color === "dark-green" ? "bg-green1" : "bg-green5"} bg-green1 rounded-full p-3 mb-2`}
                    >
                      <img src={icon} alt={title} className="w-[25px]" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-center text-base sm:text-md">
                      {title}
                    </h3>
                    <p className="text-gray-700 text-xss ss:text-ss sm:text-sm text-center font-medium">
                      {desc}
                    </p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
