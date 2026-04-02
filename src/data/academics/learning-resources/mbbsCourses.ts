// MBBS Courses organized by Preclinical (Year 1-3) and Clinical (Year 4-6) sections

export interface MBBSCourse {
  courseCode: string;
  courseTitle: string;
}

export interface SemesterCourses {
  First: MBBSCourse[];
  Second: MBBSCourse[];
}

export interface LevelCourses {
  [level: string]: SemesterCourses;
}

// Preclinical Courses (100L - 300L / Year 1-3)
export const preclinicalCourses: LevelCourses = {
  "100": {
    First: [
      { courseCode: "PHY 101", courseTitle: "General Physics I (Mechanics & Properties of Matter)" },
      { courseCode: "CHM 101", courseTitle: "General Chemistry I (Inorganic Chemistry)" },
      { courseCode: "BIO 101", courseTitle: "General Biology I (Cell Biology)" },
      { courseCode: "MTH 101", courseTitle: "Elementary Mathematics I" },
      { courseCode: "GST 101", courseTitle: "Use of English I" },
      { courseCode: "GST 103", courseTitle: "Philosophy and Logic" },
      { courseCode: "GST 105", courseTitle: "Nigerian History and Culture" },
      { courseCode: "ANA 101", courseTitle: "Introduction to Anatomy" },
      { courseCode: "PHY 103", courseTitle: "Medical Physics I" },
    ],
    Second: [
      { courseCode: "PHY 102", courseTitle: "General Physics II (Electricity & Magnetism)" },
      { courseCode: "CHM 102", courseTitle: "General Chemistry II (Organic Chemistry)" },
      { courseCode: "BIO 102", courseTitle: "General Biology II (Genetics)" },
      { courseCode: "MTH 102", courseTitle: "Elementary Mathematics II" },
      { courseCode: "GST 102", courseTitle: "Use of English II" },
      { courseCode: "GST 108", courseTitle: "Social Science" },
      { courseCode: "BCH 101", courseTitle: "Introduction to Biochemistry" },
      { courseCode: "PHY 104", courseTitle: "Medical Physics II" },
    ],
  },
  "200": {
    First: [
      { courseCode: "ANA 201", courseTitle: "Gross Anatomy of Upper Limb" },
      { courseCode: "ANA 203", courseTitle: "Gross Anatomy of Thorax" },
      { courseCode: "ANA 205", courseTitle: "Histology I (Basic Tissues)" },
      { courseCode: "PHY 201", courseTitle: "Human Physiology I (Cell Physiology)" },
      { courseCode: "PHY 203", courseTitle: "Blood and Body Fluids Physiology" },
      { courseCode: "BCH 201", courseTitle: "General Biochemistry I" },
      { courseCode: "BCH 203", courseTitle: "Chemistry of Carbohydrates" },
      { courseCode: "GST 201", courseTitle: "Citizenship Education" },
    ],
    Second: [
      { courseCode: "ANA 202", courseTitle: "Gross Anatomy of Lower Limb" },
      { courseCode: "ANA 204", courseTitle: "Gross Anatomy of Abdomen & Pelvis" },
      { courseCode: "ANA 206", courseTitle: "Histology II (Organ Systems)" },
      { courseCode: "ANA 208", courseTitle: "Embryology I (General Embryology)" },
      { courseCode: "PHY 202", courseTitle: "Cardiovascular Physiology" },
      { courseCode: "PHY 204", courseTitle: "Respiratory Physiology" },
      { courseCode: "BCH 202", courseTitle: "General Biochemistry II" },
      { courseCode: "BCH 204", courseTitle: "Chemistry of Lipids and Proteins" },
    ],
  },
  "300": {
    First: [
      { courseCode: "ANA 301", courseTitle: "Neuroanatomy I" },
      { courseCode: "ANA 303", courseTitle: "Gross Anatomy of Head & Neck" },
      { courseCode: "ANA 305", courseTitle: "Embryology II (Systemic Embryology)" },
      { courseCode: "PHY 301", courseTitle: "Renal Physiology" },
      { courseCode: "PHY 303", courseTitle: "Gastrointestinal Physiology" },
      { courseCode: "PHY 305", courseTitle: "Neurophysiology I" },
      { courseCode: "BCH 301", courseTitle: "Enzymology" },
      { courseCode: "BCH 303", courseTitle: "Metabolism of Carbohydrates" },
    ],
    Second: [
      { courseCode: "ANA 302", courseTitle: "Neuroanatomy II" },
      { courseCode: "ANA 304", courseTitle: "Histology III (Advanced)" },
      { courseCode: "PHY 302", courseTitle: "Endocrine Physiology" },
      { courseCode: "PHY 304", courseTitle: "Reproductive Physiology" },
      { courseCode: "PHY 306", courseTitle: "Neurophysiology II" },
      { courseCode: "BCH 302", courseTitle: "Metabolism of Lipids" },
      { courseCode: "BCH 304", courseTitle: "Metabolism of Proteins & Nucleic Acids" },
      { courseCode: "BCH 306", courseTitle: "Clinical Biochemistry" },
    ],
  },
};

// Clinical Courses (400L - 600L / Year 4-6)
export const clinicalCourses: LevelCourses = {
  "400": {
    First: [
      { courseCode: "PAT 401", courseTitle: "General Pathology I" },
      { courseCode: "PAT 403", courseTitle: "Systemic Pathology I" },
      { courseCode: "PHA 401", courseTitle: "General Pharmacology I" },
      { courseCode: "PHA 403", courseTitle: "Autonomic Pharmacology" },
      { courseCode: "MIC 401", courseTitle: "General Microbiology" },
      { courseCode: "MIC 403", courseTitle: "Medical Bacteriology I" },
      { courseCode: "CHE 401", courseTitle: "Chemical Pathology I" },
      { courseCode: "HAE 401", courseTitle: "Haematology I" },
    ],
    Second: [
      { courseCode: "PAT 402", courseTitle: "General Pathology II" },
      { courseCode: "PAT 404", courseTitle: "Systemic Pathology II" },
      { courseCode: "PHA 402", courseTitle: "General Pharmacology II" },
      { courseCode: "PHA 404", courseTitle: "Cardiovascular Pharmacology" },
      { courseCode: "MIC 402", courseTitle: "Medical Bacteriology II" },
      { courseCode: "MIC 404", courseTitle: "Medical Virology" },
      { courseCode: "CHE 402", courseTitle: "Chemical Pathology II" },
      { courseCode: "HAE 402", courseTitle: "Haematology II" },
      { courseCode: "PAR 401", courseTitle: "Medical Parasitology" },
    ],
  },
  "500": {
    First: [
      { courseCode: "MED 501", courseTitle: "Internal Medicine I (General Medicine)" },
      { courseCode: "MED 503", courseTitle: "Cardiology" },
      { courseCode: "MED 505", courseTitle: "Pulmonology" },
      { courseCode: "SUR 501", courseTitle: "General Surgery I" },
      { courseCode: "SUR 503", courseTitle: "Surgical Techniques" },
      { courseCode: "PED 501", courseTitle: "Paediatrics I (General Paediatrics)" },
      { courseCode: "O&G 501", courseTitle: "Obstetrics I" },
      { courseCode: "PSY 501", courseTitle: "Psychiatry I" },
      { courseCode: "COM 501", courseTitle: "Community Medicine I (Epidemiology)" },
    ],
    Second: [
      { courseCode: "MED 502", courseTitle: "Internal Medicine II (Gastroenterology)" },
      { courseCode: "MED 504", courseTitle: "Nephrology" },
      { courseCode: "MED 506", courseTitle: "Neurology" },
      { courseCode: "SUR 502", courseTitle: "General Surgery II" },
      { courseCode: "SUR 504", courseTitle: "Orthopaedic Surgery" },
      { courseCode: "PED 502", courseTitle: "Paediatrics II (Neonatology)" },
      { courseCode: "O&G 502", courseTitle: "Gynaecology I" },
      { courseCode: "PSY 502", courseTitle: "Psychiatry II" },
      { courseCode: "COM 502", courseTitle: "Community Medicine II (Public Health)" },
    ],
  },
  "600": {
    First: [
      { courseCode: "MED 601", courseTitle: "Internal Medicine III (Endocrinology)" },
      { courseCode: "MED 603", courseTitle: "Haematology/Oncology" },
      { courseCode: "MED 605", courseTitle: "Infectious Diseases" },
      { courseCode: "SUR 601", courseTitle: "Cardiothoracic Surgery" },
      { courseCode: "SUR 603", courseTitle: "Neurosurgery" },
      { courseCode: "SUR 605", courseTitle: "Urology" },
      { courseCode: "PED 601", courseTitle: "Paediatrics III (Emergencies)" },
      { courseCode: "O&G 601", courseTitle: "Obstetrics II (High Risk Pregnancy)" },
      { courseCode: "OPH 601", courseTitle: "Ophthalmology" },
      { courseCode: "ENT 601", courseTitle: "Otorhinolaryngology (ENT)" },
    ],
    Second: [
      { courseCode: "MED 602", courseTitle: "Internal Medicine IV (Dermatology)" },
      { courseCode: "MED 604", courseTitle: "Geriatric Medicine" },
      { courseCode: "SUR 602", courseTitle: "Plastic & Reconstructive Surgery" },
      { courseCode: "SUR 604", courseTitle: "Paediatric Surgery" },
      { courseCode: "PED 602", courseTitle: "Paediatrics IV (Adolescent Health)" },
      { courseCode: "O&G 602", courseTitle: "Gynaecology II (Gynaecologic Oncology)" },
      { courseCode: "ANA 601", courseTitle: "Anaesthesiology" },
      { courseCode: "RAD 601", courseTitle: "Radiology & Imaging" },
      { courseCode: "COM 601", courseTitle: "Community Medicine III (Health Management)" },
      { courseCode: "FOR 601", courseTitle: "Forensic Medicine & Toxicology" },
    ],
  },
};

// Combined structure for easy access
export const mbbsCourses = {
  preclinical: preclinicalCourses,
  clinical: clinicalCourses,
};

// Helper function to get all courses for a specific level and semester
export function getCoursesForLevelAndSemester(level: string, semester: "First" | "Second"): MBBSCourse[] {
  const numLevel = parseInt(level);
  
  if (numLevel <= 300) {
    return preclinicalCourses[level]?.[semester] || [];
  } else {
    return clinicalCourses[level]?.[semester] || [];
  }
}

// Helper to determine if a level is preclinical or clinical
export function isPreclinical(level: string): boolean {
  const numLevel = parseInt(level);
  return numLevel <= 300;
}

// Get section name based on level
export function getSectionName(level: string): string {
  return isPreclinical(level) ? "Preclinical" : "Clinical";
}
