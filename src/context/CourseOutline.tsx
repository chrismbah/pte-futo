import { createContext, useContext, useState } from "react";
import type { CourseOutlineContextProviderProps } from "../models/academics/course-outline/courseOutline";

export const CourseOutlineContext = createContext<any | null>(null);

export function useCourseOutlineContext() {
  return useContext(CourseOutlineContext);
}

export default function CourseOutlineContextProvider({
  children,
}: CourseOutlineContextProviderProps) {
  const [semester, setSemester] = useState<string>("First");
  const [semester100L, setSemester100L] = useState<string>("First");
  const [semester200L, setSemester200L] = useState<string>("First");
  const [semester300L, setSemester300L] = useState<string>("First");
  const [semester400L, setSemester400L] = useState<string>("First");
  const [semester500L, setSemester500L] = useState<string>("First");
  

  const CourseOutlineContextValue = {
    semester100L,
    setSemester100L,
    semester200L,
    setSemester200L,
    semester300L,
    setSemester300L,
    semester400L,
    setSemester400L,
    semester500L,
    setSemester500L,
    semester,
    setSemester,
  };
  return (
    <CourseOutlineContext.Provider value={CourseOutlineContextValue}>
      {children}
    </CourseOutlineContext.Provider>
  );
}
