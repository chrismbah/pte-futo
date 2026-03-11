/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC } from "react";
import { getCoursesForLevelAndSemester } from "../../../../../data/academics/learning-resources/mbbsCourses";

interface CourseOptionsProp {
  level: string;
  semester: string;
}

export const CourseOptions: FC<CourseOptionsProp> = ({ level, semester }) => {
  const courses = getCoursesForLevelAndSemester(level, semester as "First" | "Second");
  
  if (courses.length === 0) {
    return <option disabled>Choose Level and Semester</option>;
  }

  return (
    <>
      {courses.map((course, index) => (
        <option value={course.courseCode} key={index}>
          {course.courseCode} - {course.courseTitle}
        </option>
      ))}
    </>
  );
};
