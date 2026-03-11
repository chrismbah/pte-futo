import type { CustomFlowbiteTheme } from "flowbite-react";

export const customNavTheme: CustomFlowbiteTheme["navbar"] = {
  link: {
    base: "block py-2 pr-4 pl-3 md:p-0 ",
    active: {
      on: "text-sm ss:text-sm lg:text-base border-b md:border-none border-gray-100 bg-cyan-700 text-green1 md:bg-transparent md:text-green1",
      off: "text-sm ss:text-sm lg:text-base border-b border-gray-100 text-gray-700 hover:bg-gray-50 md:border-0 md:hover:bg-transparent md:hover:text-green1",
    },
  },
  toggle: {
    "base": "mt-1 inline-flex items-center rounded-lg p-2 text-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden",
    "icon": "h-6 w-6 shrink-0"
  }
};

