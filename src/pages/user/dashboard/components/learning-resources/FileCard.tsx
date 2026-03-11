import { FC, useState } from "react";
import { convertBytes } from "../../../../../helpers/convertBytes";
import { storage } from "../../../../../config/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { Content } from "../../../../../models/academics/learning-resources";
import { notifyUser } from "../../../../../helpers/notifyUser";
import { Spinner } from "../../../../../components/loaders/Spinner";
import { Tooltip } from "flowbite-react";
import { customTooltipTheme } from "../../../../../themes/customTooltip";
import { FileDownloadIcon } from "../../../../../components/icons/general/FileDownloadIcon";
import { useGetUserInfo } from "../../../../../hooks/auth/useGetUserInfo";

interface FileCardProps extends Content {
  description?: string;
  url?: string;
}

export const FileCard: FC<FileCardProps> = ({ name, size, path, description, url }) => {
  const [fileLoading, setFileLoading] = useState(false);
  const storageRef = ref(storage);
  const learningResourcesRef = ref(storageRef, path);
  const dataSize = convertBytes(size);
  const { user } = useGetUserInfo();

  const downloadFile = async () => {
    if (!user) {
      notifyUser("info", "Please login to access this feature.");
      return;
    }
    try {
      setFileLoading(true);
      notifyUser("loading", "Please wait...");
      
      // If we have a direct URL (from admin upload via Supabase), use it directly
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setFileLoading(false);
        notifyUser("success", "File Downloading...");
        return;
      }
      
      // Otherwise use Firebase Storage
      const downloadUrl = await getDownloadURL(learningResourcesRef);
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setFileLoading(false);
      notifyUser("success", "File Downloading...");
    } catch (error) {
      setFileLoading(false);
      notifyUser("error", "Something went wrong. Please try again");
    }
  };

  return (
    <div
      className={`w-full ${description ? 'min-h-[100px] ss:min-h-[120px] sss:min-h-[140px]' : 'h-[80px] ss:h-[100px] sss:h-[120px]'} shadow bg-white cursor-pointer
       hover:shadow-lg transition duration-150 rounded-md p-2 ss:p-4 `}
    >
      <div className="relative h-full w-full flex flex-col">
        <p className="text-xss sss:text-ss xsm:text-sm font-semibold text-wrap text-gray-800 line-clamp-2">
          {name}
        </p>
        {description && (
          <p className="text-sss sss:text-xss text-gray-500 mt-1 line-clamp-2">{description}</p>
        )}
        <div className="flex-1" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-sss sss:text-xss xsm:text-ss font-[500] text-gray-600">
            {dataSize}
          </span>
          <div>
            {fileLoading ? (
              <Spinner className="w-4 sm:w-6" />
            ) : (
              <Tooltip
                content="Download"
                animation="duration-500"
                theme={customTooltipTheme}
              >
                <button onClick={downloadFile}>
                  <FileDownloadIcon className="mt-1 w-4 md:w-5" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
