/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC } from "react";
import { StyleProp } from "../../../models/style";

export const TextAnalyticsIcon: FC<StyleProp> = ({ className, color }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M3 5H21M3 9H21M3 13H21M3 17H21M3 21H21"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M5 5H2M5 9H2M5 13H2M5 17H2M5 21H2"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </svg>
  );
};
