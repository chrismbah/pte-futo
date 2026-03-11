import logo from "../../assets/logo/logo.png";
import { WebIcon } from "../icons/socials/WebIcon";
import { XIcon } from "../icons/socials/XIcon";
import { InstagramIcon } from "../icons/socials/InstagramIcon";

export default function Footer() {
  return (
    <footer className="bg-green1 text-white">
      <div className="box-width p-4 py-6 lg:py-8 xsm:px-14">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="/" className="flex items-center">
              <img src={logo} className="w-8 sm:w-10 mr-2" alt="PTE Logo" />
              <span className="self-center text-xs xsm:text-base font-bold whitespace-wrap">
                Medicine and Surgery Department,{" "}
                <br className="hidden md:block" /> EBSU
              </span>
            </a>
          </div>
          <div className="grid xxss:grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-2 sm:mb-3 text-sm md:text-xs font-semibold text-white uppercase">
                Resources
              </h2>
              <ul className="text-white font-medium text-ss md:text-sm flex flex-col gap-2 sm:gap-4 ">
                <li>
                  <a href="https://ebsu.edu.ng/" className="hover:underline">
                    EBSU Website
                  </a>
                </li>
                <li className="">
                  <a
                    href="https://portal.ebsu.edu.ng/"
                    className="hover:underline"
                  >
                    EBSU Portal
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-2 sm:mb-3 text-sm md:text-xs font-semibold text-white uppercase">
                Academics
              </h2>
              <ul className="text-white font-medium text-ss md:text-sm flex flex-col gap-2 sm:gap-4">
                <li className="">
                  <a href="/calculate-gpa" className="hover:underline">
                    GPA Calculator
                  </a>
                </li>
                <li className="">
                  <a href="/course-outlines" className="hover:underline">
                    Course Outlines
                  </a>
                </li>{" "}
                <li>
                  <a href="/learning-resources" className="hover:underline">
                    Learning Resources
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-2 sm:mb-3 text-sm md:text-xs font-semibold text-white uppercase">
                Useful Links
              </h2>
              <ul className="text-white font-medium text-ss md:text-sm flex flex-col gap-2 sm:gap-4">
                <li className="">
                  <a href="/about/about-us" className="hover:underline">
                    About Us
                  </a>
                </li>
                <li className="">
                  <a href="/blog" className="hover:underline">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/students/project-team" className="hover:underline">
                    Project Team
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex flex-col justify-start items-start">
            <span className="text-xss ss:text-ss md:text-sm text-white sm:text-center">
              © 2026{" "}
              <a href="/" className="hover:underline text-white">
                EBSUMSA-EBSU.
              </a>
            </span>
            <span className="text-ss md:text-sm text-white sm:text-center">
              Built by EBSUMSA Tech Team. All Rights Reserved.
            </span>
          </div>

          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <a
              href="https://www.instagram.com/ebsumsaofficial?igsh=Z2JxMGtpMTJkOXYx"
              className="text-white hover:text-white/80"
            >
              <InstagramIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 fill-white" />
            </a>

            <a
              href="https://x.com/Ebsumsaofficial"
              className="text-white hover:text-white/80 ms-2"
            >
              <XIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" />
            </a>
            <a
              href="https://ebsu.edu.ng/"
              className="text-white hover:text-white/80 ms-2"
            >
              <WebIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
