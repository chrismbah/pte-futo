import { Courses, ClinicalCourses } from "../../../models/academics/learning-resources";

// MBBS Courses for Learning Resources - organized by level and semester
// Preclinical Years (100L - 300L): Organized by First and Second Semester
// Clinical Years (400L - 600L): No semester division - continuous clinical rotations

export const courses: Courses = {
  100: {
    First: {
      courseInfo: [
        {
          courseCode: "PHY 101",
          courseTitle: "General Physics I (Mechanics & Properties of Matter)",
          id: "PHY101",
          tip: "Focus on understanding fundamental physics concepts. Practice problem-solving regularly and attend all lab sessions.",
        },
        {
          courseCode: "CHM 101",
          courseTitle: "General Chemistry I (Inorganic Chemistry)",
          id: "CHM101",
          tip: "Build a strong foundation in atomic structure, periodic table, and chemical bonding. Essential for biochemistry later.",
        },
        {
          courseCode: "BIO 101",
          courseTitle: "General Biology I (Cell Biology)",
          id: "BIO101",
          tip: "Master cell structure and function - this is crucial for understanding histology and pathology in clinical years.",
        },
        {
          courseCode: "MTH 101",
          courseTitle: "Elementary Mathematics I",
          id: "MTH101",
          tip: "Mathematics is essential for biostatistics. Practice regularly and seek help early if struggling.",
        },
        {
          courseCode: "GST 101",
          courseTitle: "Use of English I",
          id: "GST101",
          tip: "Good communication skills are essential for medical practice. Focus on academic writing and comprehension.",
        },
        {
          courseCode: "ANA 101",
          courseTitle: "Introduction to Anatomy",
          id: "ANA101",
          tip: "Your first introduction to the human body. Start building anatomical vocabulary early.",
        },
        {
          courseCode: "GST 103",
          courseTitle: "Philosophy and Logic",
          id: "GST103",
          tip: "Develop critical thinking skills essential for clinical reasoning and medical ethics.",
        },
        {
          courseCode: "PHY 103",
          courseTitle: "Medical Physics I",
          id: "PHY103",
          tip: "Introduction to physics as applied to medicine - radiation, imaging principles, and biophysics.",
        },
      ],
    },
    Second: {
      courseInfo: [
        {
          courseCode: "PHY 102",
          courseTitle: "General Physics II (Electricity & Magnetism)",
          id: "PHY102",
          tip: "Understanding electricity is important for understanding nerve impulses and cardiac physiology.",
        },
        {
          courseCode: "CHM 102",
          courseTitle: "General Chemistry II (Organic Chemistry)",
          id: "CHM102",
          tip: "Organic chemistry is the foundation of biochemistry. Master functional groups and reaction mechanisms.",
        },
        {
          courseCode: "BIO 102",
          courseTitle: "General Biology II (Genetics)",
          id: "BIO102",
          tip: "Genetics is increasingly important in medicine. Focus on Mendelian genetics and molecular genetics.",
        },
        {
          courseCode: "MTH 102",
          courseTitle: "Elementary Mathematics II",
          id: "MTH102",
          tip: "Continue building mathematical skills for biostatistics and research methods.",
        },
        {
          courseCode: "BCH 101",
          courseTitle: "Introduction to Biochemistry",
          id: "BCH101",
          tip: "Start understanding biological molecules - this is crucial for understanding metabolism and pharmacology.",
        },
        {
          courseCode: "GST 102",
          courseTitle: "Use of English II",
          id: "GST102",
          tip: "Develop strong written and oral communication skills essential for patient interactions.",
        },
        {
          courseCode: "GST 108",
          courseTitle: "Social Science",
          id: "GST108",
          tip: "Understanding social dynamics helps in patient care and community health.",
        },
        {
          courseCode: "PHY 104",
          courseTitle: "Medical Physics II",
          id: "PHY104",
          tip: "Continued physics applications in medicine - ultrasound, MRI principles, and medical instrumentation.",
        },
      ],
    },
  },
  200: {
    First: {
      courseInfo: [
        {
          courseCode: "ANA 201",
          courseTitle: "Gross Anatomy of Upper Limb",
          id: "ANA201",
          tip: "Learn anatomy systematically. Use cadaveric dissection time wisely and correlate with clinical applications.",
        },
        {
          courseCode: "ANA 203",
          courseTitle: "Gross Anatomy of Thorax",
          id: "ANA203",
          tip: "Master thoracic anatomy - crucial for understanding cardiopulmonary conditions and procedures.",
        },
        {
          courseCode: "ANA 205",
          courseTitle: "Histology I (Basic Tissues)",
          id: "ANA205",
          tip: "Learn to identify tissues under microscopy. Regular practical sessions are essential.",
        },
        {
          courseCode: "PHY 201",
          courseTitle: "Human Physiology I (Cell Physiology)",
          id: "PHY201",
          tip: "Understanding cell physiology is fundamental to all organ system physiology.",
        },
        {
          courseCode: "PHY 203",
          courseTitle: "Blood and Body Fluids Physiology",
          id: "PHY203",
          tip: "Master hematology basics - important for understanding anemia, clotting disorders, and transfusion medicine.",
        },
        {
          courseCode: "BCH 201",
          courseTitle: "General Biochemistry I",
          id: "BCH201",
          tip: "Build on chemistry knowledge to understand enzyme function and metabolic pathways.",
        },
        {
          courseCode: "BCH 203",
          courseTitle: "Chemistry of Carbohydrates",
          id: "BCH203",
          tip: "Essential for understanding diabetes and energy metabolism.",
        },
        {
          courseCode: "GST 201",
          courseTitle: "Citizenship Education",
          id: "GST201",
          tip: "Understand civic responsibilities and national development.",
        },
      ],
    },
    Second: {
      courseInfo: [
        {
          courseCode: "ANA 202",
          courseTitle: "Gross Anatomy of Lower Limb",
          id: "ANA202",
          tip: "Learn lower limb anatomy with clinical correlations - fractures, nerve injuries, and vascular conditions.",
        },
        {
          courseCode: "ANA 204",
          courseTitle: "Gross Anatomy of Abdomen & Pelvis",
          id: "ANA204",
          tip: "Critical for understanding GI conditions, renal diseases, and reproductive anatomy.",
        },
        {
          courseCode: "ANA 206",
          courseTitle: "Histology II (Organ Systems)",
          id: "ANA206",
          tip: "Connect tissue structure to organ function. Important for pathology understanding.",
        },
        {
          courseCode: "ANA 208",
          courseTitle: "Embryology I (General Embryology)",
          id: "ANA208",
          tip: "Understanding development helps explain congenital anomalies and birth defects.",
        },
        {
          courseCode: "PHY 202",
          courseTitle: "Cardiovascular Physiology",
          id: "PHY202",
          tip: "Master cardiac physiology - essential for understanding heart failure, arrhythmias, and hypertension.",
        },
        {
          courseCode: "PHY 204",
          courseTitle: "Respiratory Physiology",
          id: "PHY204",
          tip: "Understand gas exchange and ventilation - crucial for managing respiratory conditions.",
        },
        {
          courseCode: "BCH 202",
          courseTitle: "General Biochemistry II",
          id: "BCH202",
          tip: "Deepen understanding of molecular biology and its applications in medicine.",
        },
        {
          courseCode: "BCH 204",
          courseTitle: "Chemistry of Lipids and Proteins",
          id: "BCH204",
          tip: "Essential for understanding atherosclerosis, lipid disorders, and nutritional biochemistry.",
        },
      ],
    },
  },
  300: {
    First: {
      courseInfo: [
        {
          courseCode: "ANA 301",
          courseTitle: "Neuroanatomy I",
          id: "ANA301",
          tip: "Neuroanatomy is challenging but crucial. Learn systematically and use clinical cases to reinforce learning.",
        },
        {
          courseCode: "ANA 303",
          courseTitle: "Gross Anatomy of Head & Neck",
          id: "ANA303",
          tip: "Complex region with many structures. Focus on layers, spaces, and clinical correlations.",
        },
        {
          courseCode: "ANA 305",
          courseTitle: "Embryology II (Systemic Embryology)",
          id: "ANA305",
          tip: "Learn how each organ system develops - helps understand congenital malformations.",
        },
        {
          courseCode: "PHY 301",
          courseTitle: "Renal Physiology",
          id: "PHY301",
          tip: "Master kidney function - essential for understanding fluid balance and kidney diseases.",
        },
        {
          courseCode: "PHY 303",
          courseTitle: "Gastrointestinal Physiology",
          id: "PHY303",
          tip: "Understand digestion and absorption - important for GI conditions and nutritional medicine.",
        },
        {
          courseCode: "PHY 305",
          courseTitle: "Neurophysiology I",
          id: "PHY305",
          tip: "Learn how the nervous system works - crucial for neurology and psychiatry.",
        },
        {
          courseCode: "BCH 301",
          courseTitle: "Enzymology",
          id: "BCH301",
          tip: "Enzyme kinetics and mechanisms - foundation for understanding drug actions.",
        },
        {
          courseCode: "BCH 303",
          courseTitle: "Metabolism of Carbohydrates",
          id: "BCH303",
          tip: "Master glycolysis, gluconeogenesis, and glycogen metabolism - essential for understanding diabetes.",
        },
      ],
    },
    Second: {
      courseInfo: [
        {
          courseCode: "ANA 302",
          courseTitle: "Neuroanatomy II",
          id: "ANA302",
          tip: "Continue building neuroanatomy knowledge with clinical correlations.",
        },
        {
          courseCode: "ANA 304",
          courseTitle: "Histology III (Advanced)",
          id: "ANA304",
          tip: "Advanced tissue study preparing you for pathology.",
        },
        {
          courseCode: "PHY 302",
          courseTitle: "Endocrine Physiology",
          id: "PHY302",
          tip: "Hormones control many body functions - essential for understanding endocrine disorders.",
        },
        {
          courseCode: "PHY 304",
          courseTitle: "Reproductive Physiology",
          id: "PHY304",
          tip: "Important for obstetrics, gynecology, and understanding infertility.",
        },
        {
          courseCode: "PHY 306",
          courseTitle: "Neurophysiology II",
          id: "PHY306",
          tip: "Advanced nervous system function - prepare for clinical neurology.",
        },
        {
          courseCode: "BCH 302",
          courseTitle: "Metabolism of Lipids",
          id: "BCH302",
          tip: "Understand fat metabolism - crucial for cardiovascular disease understanding.",
        },
        {
          courseCode: "BCH 304",
          courseTitle: "Metabolism of Proteins & Nucleic Acids",
          id: "BCH304",
          tip: "Protein and DNA/RNA metabolism - important for understanding genetic disorders.",
        },
        {
          courseCode: "BCH 306",
          courseTitle: "Clinical Biochemistry",
          id: "BCH306",
          tip: "Learn to interpret laboratory tests - directly applicable to clinical practice.",
        },
      ],
    },
  },
};

// Clinical Years Courses (400L - 600L) - No semester division
// These years focus on clinical rotations and are not divided into semesters
export const clinicalCourses: ClinicalCourses = {
  400: {
    courseInfo: [
      // Pathology Courses
      {
        courseCode: "PAT 401",
        courseTitle: "General Pathology",
        id: "PAT401",
        tip: "Foundation of understanding disease. Master cellular injury, inflammation, healing, and neoplasia.",
      },
      {
        courseCode: "PAT 402",
        courseTitle: "Systemic Pathology I (Cardiovascular & Respiratory)",
        id: "PAT402",
        tip: "Apply general pathology concepts to heart and lung diseases.",
      },
      {
        courseCode: "PAT 403",
        courseTitle: "Systemic Pathology II (GI & Hepatobiliary)",
        id: "PAT403",
        tip: "Learn pathology of digestive system disorders and liver diseases.",
      },
      {
        courseCode: "PAT 404",
        courseTitle: "Systemic Pathology III (Renal & Endocrine)",
        id: "PAT404",
        tip: "Master kidney pathology and endocrine system disorders.",
      },
      // Pharmacology Courses
      {
        courseCode: "PHA 401",
        courseTitle: "General Pharmacology",
        id: "PHA401",
        tip: "Understand pharmacokinetics, pharmacodynamics, and drug interactions.",
      },
      {
        courseCode: "PHA 402",
        courseTitle: "Autonomic Pharmacology",
        id: "PHA402",
        tip: "Learn drugs affecting the autonomic nervous system - widely used clinically.",
      },
      {
        courseCode: "PHA 403",
        courseTitle: "Cardiovascular Pharmacology",
        id: "PHA403",
        tip: "Master cardiac drugs including antihypertensives, antiarrhythmics, and heart failure medications.",
      },
      {
        courseCode: "PHA 404",
        courseTitle: "CNS Pharmacology",
        id: "PHA404",
        tip: "Learn psychotropics, analgesics, anesthetics, and neurological drugs.",
      },
      {
        courseCode: "PHA 405",
        courseTitle: "Chemotherapy",
        id: "PHA405",
        tip: "Antibiotics, antivirals, antifungals, antiparasitics, and anticancer drugs.",
      },
      {
        courseCode: "PHA 406",
        courseTitle: "Endocrine & GI Pharmacology",
        id: "PHA406",
        tip: "Hormonal agents, diabetes medications, and gastrointestinal drugs.",
      },
      // Microbiology Courses
      {
        courseCode: "MIC 401",
        courseTitle: "General Microbiology",
        id: "MIC401",
        tip: "Foundation of understanding infectious diseases - bacteria, viruses, fungi, parasites.",
      },
      {
        courseCode: "MIC 402",
        courseTitle: "Medical Bacteriology",
        id: "MIC402",
        tip: "Learn clinically important bacteria - identification, pathogenesis, and treatment.",
      },
      {
        courseCode: "MIC 403",
        courseTitle: "Medical Virology",
        id: "MIC403",
        tip: "Understand viral infections including HIV, hepatitis, and emerging viruses.",
      },
      {
        courseCode: "MIC 404",
        courseTitle: "Medical Mycology",
        id: "MIC404",
        tip: "Fungal infections - superficial, subcutaneous, and systemic mycoses.",
      },
      {
        courseCode: "MIC 405",
        courseTitle: "Medical Parasitology",
        id: "MIC405",
        tip: "Important in tropical medicine - malaria, helminths, and protozoan infections.",
      },
      {
        courseCode: "MIC 406",
        courseTitle: "Immunology",
        id: "MIC406",
        tip: "Immune system function, immunodeficiencies, autoimmunity, and hypersensitivity.",
      },
      // Chemical Pathology & Haematology
      {
        courseCode: "CHE 401",
        courseTitle: "Chemical Pathology I",
        id: "CHE401",
        tip: "Learn to interpret biochemical tests - electrolytes, liver function, kidney function.",
      },
      {
        courseCode: "CHE 402",
        courseTitle: "Chemical Pathology II",
        id: "CHE402",
        tip: "Advanced clinical chemistry - lipid profile, cardiac markers, tumor markers.",
      },
      {
        courseCode: "HAE 401",
        courseTitle: "Haematology I",
        id: "HAE401",
        tip: "Blood disorders - anemia, polycythemia, and white cell disorders.",
      },
      {
        courseCode: "HAE 402",
        courseTitle: "Haematology II",
        id: "HAE402",
        tip: "Coagulation disorders, transfusion medicine, and bone marrow disorders.",
      },
      // Forensic Medicine
      {
        courseCode: "FOR 401",
        courseTitle: "Forensic Medicine & Medical Jurisprudence",
        id: "FOR401",
        tip: "Medicolegal aspects of medical practice - documentation, consent, and court procedures.",
      },
    ],
  },
  500: {
    courseInfo: [
      // Internal Medicine
      {
        courseCode: "MED 501",
        courseTitle: "General Medicine & Clinical Methods",
        id: "MED501",
        tip: "Learn systematic patient approach, history taking, and physical examination.",
      },
      {
        courseCode: "MED 502",
        courseTitle: "Cardiology",
        id: "MED502",
        tip: "Heart failure, coronary artery disease, valvular heart disease, and arrhythmias.",
      },
      {
        courseCode: "MED 503",
        courseTitle: "Respiratory Medicine",
        id: "MED503",
        tip: "Asthma, COPD, pneumonia, tuberculosis, and lung cancer.",
      },
      {
        courseCode: "MED 504",
        courseTitle: "Gastroenterology & Hepatology",
        id: "MED504",
        tip: "Peptic ulcer, inflammatory bowel disease, liver cirrhosis, and hepatitis.",
      },
      {
        courseCode: "MED 505",
        courseTitle: "Nephrology",
        id: "MED505",
        tip: "Acute and chronic kidney disease, dialysis, and renal transplantation.",
      },
      {
        courseCode: "MED 506",
        courseTitle: "Neurology",
        id: "MED506",
        tip: "Stroke, epilepsy, Parkinson's disease, and multiple sclerosis.",
      },
      {
        courseCode: "MED 507",
        courseTitle: "Endocrinology",
        id: "MED507",
        tip: "Diabetes mellitus, thyroid disorders, adrenal diseases, and pituitary disorders.",
      },
      {
        courseCode: "MED 508",
        courseTitle: "Rheumatology & Musculoskeletal Medicine",
        id: "MED508",
        tip: "Rheumatoid arthritis, osteoarthritis, SLE, and connective tissue disorders.",
      },
      {
        courseCode: "MED 509",
        courseTitle: "Infectious Diseases",
        id: "MED509",
        tip: "HIV/AIDS, malaria, typhoid, and emerging infectious diseases.",
      },
      {
        courseCode: "MED 510",
        courseTitle: "Clinical Pharmacology & Therapeutics",
        id: "MED510",
        tip: "Applied pharmacology - rational drug prescribing and drug monitoring.",
      },
      // Surgery
      {
        courseCode: "SUR 501",
        courseTitle: "General Surgery & Surgical Principles",
        id: "SUR501",
        tip: "Wound healing, surgical infections, and pre/post-operative care.",
      },
      {
        courseCode: "SUR 502",
        courseTitle: "Abdominal Surgery",
        id: "SUR502",
        tip: "Appendicitis, hernias, intestinal obstruction, and biliary surgery.",
      },
      {
        courseCode: "SUR 503",
        courseTitle: "Trauma & Emergency Surgery",
        id: "SUR503",
        tip: "Management of trauma, burns, and surgical emergencies.",
      },
      {
        courseCode: "SUR 504",
        courseTitle: "Surgical Oncology",
        id: "SUR504",
        tip: "Principles of cancer surgery - breast, colorectal, and thyroid cancers.",
      },
      {
        courseCode: "SUR 505",
        courseTitle: "Vascular Surgery",
        id: "SUR505",
        tip: "Peripheral vascular disease, aneurysms, and varicose veins.",
      },
      // Paediatrics
      {
        courseCode: "PED 501",
        courseTitle: "General Paediatrics",
        id: "PED501",
        tip: "Growth and development, immunization, and common childhood illnesses.",
      },
      {
        courseCode: "PED 502",
        courseTitle: "Neonatology",
        id: "PED502",
        tip: "Care of the newborn, prematurity, and neonatal emergencies.",
      },
      {
        courseCode: "PED 503",
        courseTitle: "Paediatric Infectious Diseases",
        id: "PED503",
        tip: "Childhood infections, fever management, and tropical diseases in children.",
      },
      {
        courseCode: "PED 504",
        courseTitle: "Paediatric Nutrition & Gastroenterology",
        id: "PED504",
        tip: "Malnutrition, infant feeding, and childhood GI disorders.",
      },
      // Obstetrics & Gynaecology
      {
        courseCode: "OBG 501",
        courseTitle: "Normal Obstetrics",
        id: "OBG501",
        tip: "Antenatal care, normal labor, and delivery management.",
      },
      {
        courseCode: "OBG 502",
        courseTitle: "High-Risk Obstetrics",
        id: "OBG502",
        tip: "Pregnancy complications - preeclampsia, gestational diabetes, and APH/PPH.",
      },
      {
        courseCode: "OBG 503",
        courseTitle: "General Gynaecology",
        id: "OBG503",
        tip: "Menstrual disorders, pelvic inflammatory disease, and endometriosis.",
      },
      {
        courseCode: "OBG 504",
        courseTitle: "Reproductive Health & Family Planning",
        id: "OBG504",
        tip: "Contraception, infertility, and reproductive health services.",
      },
      // Psychiatry
      {
        courseCode: "PSY 501",
        courseTitle: "General Psychiatry",
        id: "PSY501",
        tip: "Psychiatric assessment, common mental disorders, and psychopharmacology.",
      },
      {
        courseCode: "PSY 502",
        courseTitle: "Psychotic Disorders & Mood Disorders",
        id: "PSY502",
        tip: "Schizophrenia, bipolar disorder, and major depression.",
      },
      {
        courseCode: "PSY 503",
        courseTitle: "Anxiety Disorders & Substance Abuse",
        id: "PSY503",
        tip: "Anxiety, PTSD, OCD, and addiction psychiatry.",
      },
      // Community Medicine
      {
        courseCode: "COM 501",
        courseTitle: "Epidemiology",
        id: "COM501",
        tip: "Disease patterns, outbreak investigation, and research methodology.",
      },
      {
        courseCode: "COM 502",
        courseTitle: "Biostatistics",
        id: "COM502",
        tip: "Statistical methods for medical research and data interpretation.",
      },
      {
        courseCode: "COM 503",
        courseTitle: "Environmental & Occupational Health",
        id: "COM503",
        tip: "Environmental hazards, occupational diseases, and prevention.",
      },
    ],
  },
  600: {
    courseInfo: [
      // Advanced Internal Medicine
      {
        courseCode: "MED 601",
        courseTitle: "Clinical Medicine Clerkship",
        id: "MED601",
        tip: "Intensive bedside teaching, case presentations, and clinical decision-making.",
      },
      {
        courseCode: "MED 602",
        courseTitle: "Dermatology",
        id: "MED602",
        tip: "Skin examination, common dermatoses, and skin infections.",
      },
      {
        courseCode: "MED 603",
        courseTitle: "Clinical Oncology",
        id: "MED603",
        tip: "Cancer staging, chemotherapy, and palliative care.",
      },
      {
        courseCode: "MED 604",
        courseTitle: "Geriatric Medicine",
        id: "MED604",
        tip: "Care of elderly patients, polypharmacy, and age-related conditions.",
      },
      {
        courseCode: "MED 605",
        courseTitle: "Emergency Medicine",
        id: "MED605",
        tip: "Medical emergencies, resuscitation, and critical care.",
      },
      {
        courseCode: "MED 606",
        courseTitle: "Tropical Medicine",
        id: "MED606",
        tip: "Tropical infections, neglected tropical diseases, and travel medicine.",
      },
      // Surgical Specialties
      {
        courseCode: "SUR 601",
        courseTitle: "Orthopaedic Surgery",
        id: "SUR601",
        tip: "Fractures, dislocations, bone infections, and sports injuries.",
      },
      {
        courseCode: "SUR 602",
        courseTitle: "Neurosurgery",
        id: "SUR602",
        tip: "Head injuries, brain tumors, and spinal cord disorders.",
      },
      {
        courseCode: "SUR 603",
        courseTitle: "Cardiothoracic Surgery",
        id: "SUR603",
        tip: "Cardiac surgery basics, thoracic trauma, and lung surgery.",
      },
      {
        courseCode: "SUR 604",
        courseTitle: "Urology",
        id: "SUR604",
        tip: "Urinary tract infections, kidney stones, prostate diseases, and bladder cancer.",
      },
      {
        courseCode: "SUR 605",
        courseTitle: "Plastic & Reconstructive Surgery",
        id: "SUR605",
        tip: "Wound management, burns, and reconstructive procedures.",
      },
      {
        courseCode: "SUR 606",
        courseTitle: "Paediatric Surgery",
        id: "SUR606",
        tip: "Surgical conditions in children - hernias, intussusception, and congenital anomalies.",
      },
      // Advanced Paediatrics
      {
        courseCode: "PED 601",
        courseTitle: "Paediatric Cardiology",
        id: "PED601",
        tip: "Congenital heart diseases and acquired cardiac conditions in children.",
      },
      {
        courseCode: "PED 602",
        courseTitle: "Paediatric Neurology",
        id: "PED602",
        tip: "Seizures, cerebral palsy, and developmental disorders.",
      },
      {
        courseCode: "PED 603",
        courseTitle: "Paediatric Emergencies",
        id: "PED603",
        tip: "Acute paediatric emergencies, resuscitation, and critical care.",
      },
      {
        courseCode: "PED 604",
        courseTitle: "Adolescent Health",
        id: "PED604",
        tip: "Adolescent development, mental health, and reproductive health.",
      },
      // Advanced O&G
      {
        courseCode: "OBG 601",
        courseTitle: "Obstetric Emergencies",
        id: "OBG601",
        tip: "Management of obstetric emergencies - eclampsia, PPH, and obstructed labor.",
      },
      {
        courseCode: "OBG 602",
        courseTitle: "Gynaecological Oncology",
        id: "OBG602",
        tip: "Cervical, ovarian, and endometrial cancers.",
      },
      {
        courseCode: "OBG 603",
        courseTitle: "Maternal & Fetal Medicine",
        id: "OBG603",
        tip: "High-risk pregnancy management and fetal monitoring.",
      },
      // Special Senses
      {
        courseCode: "OPH 601",
        courseTitle: "Ophthalmology",
        id: "OPH601",
        tip: "Eye examination, common eye diseases, and ocular emergencies.",
      },
      {
        courseCode: "ENT 601",
        courseTitle: "Otorhinolaryngology (ENT)",
        id: "ENT601",
        tip: "Ear, nose, and throat examination and common ENT conditions.",
      },
      // Anaesthesia & Radiology
      {
        courseCode: "ANA 601",
        courseTitle: "Anaesthesiology",
        id: "ANA601",
        tip: "Principles of anesthesia, airway management, and perioperative care.",
      },
      {
        courseCode: "RAD 601",
        courseTitle: "Radiology & Medical Imaging",
        id: "RAD601",
        tip: "X-ray interpretation, CT, MRI, and ultrasound basics.",
      },
      // Community Medicine
      {
        courseCode: "COM 601",
        courseTitle: "Primary Health Care",
        id: "COM601",
        tip: "Community diagnosis, health programs, and disease prevention.",
      },
      {
        courseCode: "COM 602",
        courseTitle: "Health Management & Administration",
        id: "COM602",
        tip: "Health systems, hospital management, and health policy.",
      },
      {
        courseCode: "COM 603",
        courseTitle: "Medical Ethics & Professionalism",
        id: "COM603",
        tip: "Ethical principles, informed consent, and professional conduct.",
      },
      // Forensic Medicine
      {
        courseCode: "FOR 601",
        courseTitle: "Forensic Medicine & Toxicology",
        id: "FOR601",
        tip: "Forensic examination, death certification, and clinical toxicology.",
      },
    ],
  },
};

// Helper function to check if a level is clinical (400-600)
export const isClinicalLevel = (level: string): boolean => {
  const numLevel = parseInt(level);
  return numLevel >= 400;
};

// Get all courses for a level (handles both preclinical and clinical)
export const getCoursesForLevel = (level: string) => {
  if (isClinicalLevel(level)) {
    return clinicalCourses[level as keyof typeof clinicalCourses];
  }
  return courses[level as keyof typeof courses];
};
