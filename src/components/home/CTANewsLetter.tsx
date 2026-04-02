import { useState } from "react";
import newsLetter from "../../json/animation/newsletter.json";
import Lottie from "lottie-react";
import { useGetUserInfo } from "../../hooks/auth/useGetUserInfo";
import { ISuscribedUser } from "../../models/misc/newsletter/suscribed";
import { db } from "../../config/firebase";
import {
  collection,
  setDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { notifyUser } from "../../helpers/notifyUser";
import { Spinner } from "../loaders/Spinner";
import { BellIcon } from "../icons/general/BellIcon";
import { motion } from "framer-motion";
import { fadeInVariants1 } from "../../animation/variants";
import emailjs from "@emailjs/browser";

export default function CTANewsLetter() {
  const [subscribing, setSubscribing] = useState(false);
  const { studentDetails, userID } = useGetUserInfo();

  const sendWelcomeEmail = async (name: string, email: string) => {
    const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "service_2avshb4";
    const templateId = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID || "template_wpwl9lf";
    const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || "fpJNbTUq8_NZhbKw1";
    if (!serviceId || !templateId || !publicKey) return;
    try {
      await emailjs.send(
        serviceId,
        templateId,
        { to_name: name, to_email: email },
        publicKey
      );
    } catch {
      // Email sending failure is non-blocking — subscription still succeeds
    }
  };

  const suscribeUser = async () => {
    setSubscribing(true);
    if (studentDetails && userID) {
      try {
        const { firstName, lastName, regNo, level, email } = studentDetails;
        const uniqueDocId = `sub-${userID}`;
        const querySnapshot = await getDocs(
          query(collection(db, "suscribedUsers"), where("userID", "==", userID))
        );
        if (querySnapshot.empty) {
          const suscribedUserInfo: ISuscribedUser = {
            userID,
            firstName,
            lastName,
            email,
            regNo,
            level,
            timeStamp: new Date(),
          };
          await setDoc(doc(db, "suscribedUsers", uniqueDocId), suscribedUserInfo);
          await sendWelcomeEmail(`${firstName} ${lastName}`, email);
          setSubscribing(false);
          notifyUser("success", "Thank you for subscribing! Check your email for a welcome message.");
        } else {
          setSubscribing(false);
          notifyUser("info", "You are already subscribed");
        }
      } catch {
        setSubscribing(false);
        notifyUser("error", "Something went wrong. Please try again");
      }
    } else {
      setSubscribing(false);
      notifyUser("error", "Please login to subscribe to our newsletter");
    }
  };

  return (
    <div>
      <div className="box-width">
        <div className="px-3 xsm:px-14 xsm:py-24 py-8">
          <div className="flex items-center justify-center flex-col">
            <motion.div
              variants={fadeInVariants1}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="flex items-center justify-center flex-col xsm:flex-row gap-4 shadow-4 mt-4 rounded-lg border border-gray-100 bg-white py-3 px-4 xsm:px-8 xss:py-4 w-full max-w-[900px]"
            >
              <Lottie
                loop={true}
                animationData={newsLetter}
                className="w-[80%] xss:w-[280px] ss:w-[320px] sm:[350px]"
              />
              <div className="flex items-center flex-col w-full p-0 xsm:p-4">
                <h2 className="text-center text-md xss:text-lg sm:text-xl md:text-2xl font-[600]">
                  Stay Connected, Stay Informed
                </h2>
                <p className="text-gray-700 font-[500] text-ss ss:text-sm xlg:text-xs mb-3 text-center flex gap-2">
                  Subscribe to the EBSUMSA Newsletter and receive weekly updates on academic resources, events, opportunities, and community news delivered straight to your inbox.
                </p>
                <div className="flex items-center flex-col gap-6 w-full">
                  <button
                    onClick={suscribeUser}
                    className="w-full xsm:w-[70%] font-semibold text-white bg-green1 border-0 outline-none p-3 rounded-lg text-sm xss:text-base"
                  >
                    {subscribing ? (
                      <Spinner className="w-4 sm:w-6 fill-white" />
                    ) : (
                      <div className="w-full flex gap-3 justify-center items-center text-xs md:text-base">
                        Subscribe Now <BellIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
