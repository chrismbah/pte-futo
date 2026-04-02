import { FC } from "react";
import { CourseOutlines } from "../../../models/academics/course-outline/courseOutline";
import { Link } from "react-router-dom";
import arrow from "../../../assets/svg/icons/arrowRight.svg";

export const CourseOutlineCard: FC<CourseOutlines> = ({
  icon,
  title,
  level,
}) => {
  return (
    <Link to={`/course-outlines/${level}`}>
      <div
        className="max-w-auto xsm:max-w-[460px] p-6
       bg-white shadow-4 transition duration-200 ease-in hover:shadow-md rounded-lg"
      >
        <img src={icon} alt="Book" className="w-16 h-16" />
        <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h5>
        <p className="mb-3 font-[500] text-gray-500 text-ss sm:text-sm">
          Explore our curated collection of course outlines designed for {level}{" "}
          Level students, providing essential information to make informed
          decisions about your academic journey.
        </p>
        <div className="font-[600] inline-flex justify-start items-center text-green2">
          Check Course Outline <img src={arrow} alt=">" className="w-6" />
        </div>
      </div>
    </Link>
  );
};
