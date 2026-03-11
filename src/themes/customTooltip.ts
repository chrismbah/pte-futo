import type { CustomFlowbiteTheme } from "flowbite-react";

export const customTooltipTheme: CustomFlowbiteTheme["tooltip"] = {
  target: "w-fit",
  base: "absolute inline-block z-10 rounded-md py-1 px-1 sm:py-1.5 sm:px-1.5 text-[11px] font-medium shadow-sm",
  style: {
    dark: "bg-gray-900 text-white",
    light: "border border-gray-200 bg-white text-gray-900",
    auto: "border border-gray-200 bg-white text-gray-900",
  },
};
