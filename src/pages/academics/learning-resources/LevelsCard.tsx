import { FC } from "react";
import folder from "../../../assets/svg/icons/folder.svg";
import { LevelCard } from "../../../models/academics/learning-resources";
import { Link } from "react-router-dom";

export const LevelsCard: FC<LevelCard> = ({ level, title, desc, section }) => {
  return (
    <Link to={`/learning-resources/${level}`}>
      <div className="w-full py-8 mx-auto hover:bg-gray-100 border-2 border-transparent hover:border-green1 rounded-lg p-2 relative">
        {section && (
          <span className={`absolute top-2 right-2 text-xss px-2 py-0.5 rounded-full font-medium ${
            section === "preclinical" 
              ? "bg-blue-100 text-blue-700" 
              : "bg-green-100 text-green-700"
          }`}>
            {section === "preclinical" ? "Preclinical" : "Clinical"}
          </span>
        )}
        <div className="flex items-center justify-center">
          <div className="w-[80px] sm:w-[95px]">
            <img src={folder} alt="folder" className="w-full" />
          </div>
        </div>
        <h4
          className="flex items-center justify-center mb-2 text-center
           font-semibold text-xs md:text-base"
        >
          <div className="h-[3px] w-[30%] bg-green1" /> {title.toUpperCase()}
        </h4>
        <p className="text-center font-medium text-ss sm:text-sm text-gray-700">
          {desc}
        </p>
      </div>
    </Link>
  );
};
