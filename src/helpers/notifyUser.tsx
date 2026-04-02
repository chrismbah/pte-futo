import toast from "react-hot-toast";
import { BlueInfoIcon } from "../components/icons/general/BlueInfoIcon";
import { Spinner } from "../components/loaders/Spinner";
import { playSound } from "../hooks/useSound";

export const notifyUser = (
  state: "success" | "error" | "info" | "loading",
  message?: string | null
) => {
  if (state === "error") {
    playSound("message");
    return toast.error(<p className="notification-message">{message}</p>);
  } else if (state === "success") {
    playSound("notify");
    return toast.success(<p className="notification-message">{message}</p>);
  } else if (state === "info") {
    playSound("message");
    return toast(<p className="notification-message">{message}</p>, {
      icon: <BlueInfoIcon className="w-5 h-5" />,
    });
  } else if (state === "loading") {
    // No sound for loading — user triggered it themselves
    return toast(<p className="notification-message">{message}</p>, {
      icon: <Spinner className="w-4 h-4 fill-gray-400" />,
    });
  }
};
