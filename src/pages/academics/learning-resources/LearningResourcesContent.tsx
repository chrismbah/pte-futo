import { useParams } from "react-router-dom";
import { useLearningResourcesContext } from "../../../context/LearningResources";
import Content from "./Content";
import StudyTip from "./StudyTip";

export default function LearningResourcesContent() {
  const { id, courseTitle } = useParams();
  const { resourcesType, setResourcesType } = useLearningResourcesContext();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="box-width2">
        <div className="page-section">
          <div className="w-full flex items-center justify-center mb-6 flex-col">
            <h5 className="text-center font-bold text-xl ss:text-xll w-full uppercase text-gray-900">
              {id} E-Book Download
            </h5>
            <p className="heading-p">
              Checkout all Textbooks, Handouts , Lecture Notes and Past
              Questions relating to <br />{" "}
              <span className="font-semibold">
                {id} - {courseTitle}
              </span>{" "}
            </p>
          </div>
          <div className="flex items-center justify-center flex-wrap xxss:flex-nowrap gap-1 xss:gap-3 relative">
            <button
              onClick={() => setResourcesType("handouts")}
              className={`${resourcesType === "handouts" ? "bg-green1 text-white" : "bg-gray-100"} 
                text-gray-800 sss:p-3 p-2 text-ss  sss:text-sm xsm:text-base rounded-md font-semibold hover:bg-green1 hover:text-white transition duration-100`}
            >
              Handouts
            </button>
            <button
              onClick={() => setResourcesType("textbooks")}
              className={`${resourcesType === "textbooks" ? "bg-green1 text-white" : "bg-gray-100"} 
                text-gray-800 sss:p-3 p-2 text-ss  sss:text-sm xsm:text-base rounded-md  font-semibold hover:bg-green1 hover:text-white transition duration-100`}
            >
              Textbooks
            </button>
            <div className="relative">
              <button
                onClick={() => setResourcesType("pastquestions")}
                className={`${resourcesType === "pastquestions" ? "bg-green1 text-white" : "bg-gray-100"} 
                relative text-gray-800 sss:p-3 p-2 text-ss  sss:text-sm xsm:text-base rounded-md  font-semibold hover:bg-green1 hover:text-white transition duration-100`}
              >
                Past Questions
              </button>
              <div className="absolute -top-2 -right-5 xss:-right-8">
                <StudyTip />
              </div>
            </div>
          </div>
          <div className="w-full h-full mt-6 px-5 md:px-3 ">
            <Content />
          </div>
        </div>
      </div>
    </div>
  );
}
