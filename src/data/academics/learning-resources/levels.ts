import { LevelCard } from "../../../models/academics/learning-resources";

// Preclinical levels (Year 1-3)
export const preclinicalLevels: LevelCard[] = [
  {
    level: "100",
    title: "100 Level (Year 1)",
    desc: "Basic sciences foundation: Physics, Chemistry, Biology, Mathematics, and introductory medical courses",
    section: "preclinical" as const,
    driveUrl: "https://drive.google.com/drive/folders/12sgN__NCu-cnuckQ4AkdLLL5xByVtuna"
  },
  {
    level: "200",
    title: "200 Level (Year 2)",
    desc: "Anatomy, Physiology, and Biochemistry - Introduction to the human body structure and function",
    section: "preclinical" as const,
    driveUrl: "https://drive.google.com/drive/folders/1-JZRq-aFQzkN04ViATbH2vbCt_qgTUQg"
  },
  {
    level: "300",
    title: "300 Level (2nd MBBS)",
    desc: "Advanced Anatomy, Physiology, and Biochemistry - Completing preclinical studies",
    section: "preclinical" as const,
    driveUrl: "https://drive.google.com/drive/folders/1v-AHH-EopfBnHmh22MSENV9IHhcHPal7"
  },
];

// Clinical levels - 3rd MBBS = 400L, 4th MBBS = 500L, 5th MBBS = 600L
export const clinicalLevels: LevelCard[] = [
  {
    level: "400",
    title: "400 Level (3rd MBBS)",
    desc: "Pathology, Pharmacology, Microbiology - Understanding disease mechanisms and treatments",
    section: "clinical" as const,
    driveUrl: "https://drive.google.com/drive/folders/1-WYCxRzrAJOL3a935HlMTqwh8TvJUwko"
  },
  {
    level: "500",
    title: "500 Level (4th MBBS)",
    desc: "Clinical rotations: Medicine, Surgery, Paediatrics, Obstetrics & Gynaecology, Psychiatry",
    section: "clinical" as const,
    driveUrl: "https://drive.google.com/drive/folders/1-lhThxDEKOEbHot0iFF5uNCJeCXjJG3j"
  },
  {
    level: "600",
    title: "600 Level (5th MBBS)",
    desc: "Final clinical rotations, specialized clerkships, and preparation for MBBS examinations",
    section: "clinical" as const,
    driveUrl: "https://drive.google.com/drive/folders/1ONfXdUAIanILOqPWgqi2tYZK68oG70hi"
  },
];

// Combined for backward compatibility
export const learningResourcesLevels: LevelCard[] = [...preclinicalLevels, ...clinicalLevels];
  
