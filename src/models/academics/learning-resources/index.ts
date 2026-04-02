import { ReactNode } from "react";
export interface LearningResourcesContextProviderProps {
  children: ReactNode;
}
export interface LevelCard {
  level: string;
  title: string;
  desc: string;
  section?: "preclinical" | "clinical";
  driveUrl?: string;
}
export interface CourseCard {
  id: string;
  courseCode: string;
  courseTitle: string;
  tip: string;
}

export interface Course {
  courseCode: string;
  courseTitle: string;
  id: string;
  tip: string;
}

// Preclinical courses structure (with semesters)
export interface Courses {
  [level: string]: {
    [semester: string]: {
      courseInfo: Course[];
    };
  };
}

// Clinical courses structure (no semesters - continuous rotations)
export interface ClinicalLevelCourses {
  courseInfo: Course[];
}

export interface ClinicalCourses {
  [level: string]: ClinicalLevelCourses;
}

export interface Content {
  name: string;
  size: number;
  path: string;
}

export interface FileMetadata {
  name: string;
  path: string;
  size: number;
  url?: string;
  description?: string;
}
