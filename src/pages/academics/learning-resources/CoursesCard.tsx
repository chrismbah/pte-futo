import { FC } from "react";
import file from "../../../assets/svg/icons/file.svg";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../../hooks/misc/storage/useLocalStorage";

interface CoursesCardProps {
  id: string;
  courseCode: string;
  courseTitle: string;
  tip?: string;
}

export const CoursesCard: FC<CoursesCardProps> = ({
  id,
  courseCode,
  courseTitle,
  tip,
}) => {
  const { level } = useParams();
  const navigate = useNavigate();
  const { setDataToStorage } = useLocalStorage();

  const checkCourseResources = () => {
    if (tip) {
      setDataToStorage("studyTip", tip);
    }
    navigate(`/learning-resources/${level}/${id}/${courseTitle}`);
  };

  return (
    <div
      onClick={checkCourseResources}
      className="w-full h-[170px] p-4 flex items-center justify-center flex-col gap-2 rounded-lg
        hover:bg-gray-100 border-2 border-transparent hover:border-green1 cursor-pointer"
    >
      <div className="h-2/3 mb-1 flex flex-col items-center justify-center">
        <img src={file} alt="file" className="w-[45px] xsm:w-[60px]" />
        <p className="text-center font-semibold text-xs sm:text-base">
          {courseCode}
        </p>
      </div>
      <div className="flex items-center justify-center h-1/3">
        <p className="text-center font-medium text-ss sm:text-sm text-gray-700">
          {courseTitle}
        </p>
      </div>
    </div>
  );
};
