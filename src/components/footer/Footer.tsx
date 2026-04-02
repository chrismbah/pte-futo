import logo from "../../assets/logo/logo.png";
import { WebIcon } from "../icons/socials/WebIcon";
import { XIcon } from "../icons/socials/XIcon";
import { InstagramIcon } from "../icons/socials/InstagramIcon";
import { YouTubeIcon } from "../icons/socials/YouTubeIcon";

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
                  <a href="/u/community" className="hover:underline">
                    Active Community
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
        <hr className="my-6 border-white/20 sm:mx-auto lg:my-8" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xss ss:text-ss md:text-sm font-semibold text-white">
              &copy; EBSUMSA 2025/2026 Administration
            </span>
            <span className="text-xss ss:text-ss text-white/70">
              Built by the EBSUMSA Tech Team (Pioneers, 2025/2026). All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            <a
              href="https://www.instagram.com/ebsumsaofficial?utm_source=qr&igsh=MW5mMWlrY3g4c3lxaQ=="
              className="text-white/80 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4 md:w-5 md:h-5 fill-white" />
            </a>
            <a
              href="https://x.com/Ebsumsaofficial"
              className="text-white/80 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
            >
              <XIcon className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a
              href="https://youtube.com/@ebsumsatv?si=qWJTfD2Z4L61wrBo"
              className="text-white/80 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <YouTubeIcon className="w-4 h-4 md:w-5 md:h-5 fill-white" />
            </a>
            <a
              href="https://ebsu.edu.ng/"
              className="text-white/80 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="EBSU Website"
            >
              <WebIcon className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
