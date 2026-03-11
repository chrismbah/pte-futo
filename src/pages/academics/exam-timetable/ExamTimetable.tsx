import Footer from "../../../components/footer/Footer";
import { motion } from "framer-motion";
import { fadeInVariants1 } from "../../../animation/variants";
import { Calendar, Clock, MapPin, BookOpen } from "lucide-react";

interface ExamSchedule {
  id: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  time: string;
  venue: string;
  level: string;
}

// Sample exam timetable data
const examSchedule: ExamSchedule[] = [
  {
    id: "1",
    courseCode: "ANA 101",
    courseTitle: "Gross Anatomy of the Upper Limb",
    date: "Monday, March 17, 2025",
    time: "9:00 AM - 12:00 PM",
    venue: "Anatomy Lecture Hall",
    level: "100",
  },
  {
    id: "2",
    courseCode: "PHY 101",
    courseTitle: "General Physiology I",
    date: "Tuesday, March 18, 2025",
    time: "9:00 AM - 12:00 PM",
    venue: "Physiology Building, Hall A",
    level: "100",
  },
  {
    id: "3",
    courseCode: "BCH 101",
    courseTitle: "General Biochemistry I",
    date: "Wednesday, March 19, 2025",
    time: "2:00 PM - 5:00 PM",
    venue: "Medical Sciences Complex, Room 101",
    level: "100",
  },
  {
    id: "4",
    courseCode: "ANA 201",
    courseTitle: "Gross Anatomy of the Abdomen",
    date: "Thursday, March 20, 2025",
    time: "9:00 AM - 12:00 PM",
    venue: "Anatomy Lecture Hall",
    level: "200",
  },
  {
    id: "5",
    courseCode: "PHY 201",
    courseTitle: "Cardiovascular Physiology",
    date: "Friday, March 21, 2025",
    time: "9:00 AM - 12:00 PM",
    venue: "Physiology Building, Hall B",
    level: "200",
  },
  {
    id: "6",
    courseCode: "BCH 201",
    courseTitle: "Medical Biochemistry",
    date: "Monday, March 24, 2025",
    time: "2:00 PM - 5:00 PM",
    venue: "Medical Sciences Complex, Room 201",
    level: "200",
  },
  {
    id: "7",
    courseCode: "PAT 301",
    courseTitle: "General Pathology",
    date: "Tuesday, March 25, 2025",
    time: "9:00 AM - 12:00 PM",
    venue: "Pathology Building, Main Hall",
    level: "300",
  },
  {
    id: "8",
    courseCode: "PHA 301",
    courseTitle: "General Pharmacology",
    date: "Wednesday, March 26, 2025",
    time: "2:00 PM - 5:00 PM",
    venue: "Pharmacology Lecture Hall",
    level: "300",
  },
  {
    id: "9",
    courseCode: "MED 401",
    courseTitle: "Internal Medicine I",
    date: "Thursday, March 27, 2025",
    time: "9:00 AM - 12:00 PM",
    venue: "Clinical Skills Lab",
    level: "400",
  },
  {
    id: "10",
    courseCode: "SUR 401",
    courseTitle: "General Surgery",
    date: "Friday, March 28, 2025",
    time: "9:00 AM - 12:00 PM",
    venue: "Surgical Sciences Building",
    level: "400",
  },
  {
    id: "11",
    courseCode: "PED 501",
    courseTitle: "Paediatrics",
    date: "Monday, March 31, 2025",
    time: "9:00 AM - 12:00 PM",
    venue: "Children's Hospital, Lecture Room 1",
    level: "500",
  },
  {
    id: "12",
    courseCode: "OBG 501",
    courseTitle: "Obstetrics & Gynaecology",
    date: "Tuesday, April 1, 2025",
    time: "2:00 PM - 5:00 PM",
    venue: "Maternity Complex, Seminar Hall",
    level: "500",
  },
];

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  "100": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "200": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  "300": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  "400": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "500": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

function ExamCard({ exam, index }: { exam: ExamSchedule; index: number }) {
  const colors = levelColors[exam.level] || levelColors["100"];
  
  return (
    <motion.div
      variants={fadeInVariants1}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      custom={index}
      className={`${colors.bg} ${colors.border} border rounded-xl p-5 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${colors.text} bg-white`}>
            {exam.level} Level
          </span>
        </div>
        <span className={`font-bold ${colors.text}`}>{exam.courseCode}</span>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen size={18} className="text-gray-500" />
        {exam.courseTitle}
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar size={16} className="text-green-600" />
          <span>{exam.date}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock size={16} className="text-green-600" />
          <span>{exam.time}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin size={16} className="text-green-600" />
          <span>{exam.venue}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExamTimetable() {
  // Group exams by level
  const groupedExams = examSchedule.reduce((acc, exam) => {
    if (!acc[exam.level]) {
      acc[exam.level] = [];
    }
    acc[exam.level].push(exam);
    return acc;
  }, {} as Record<string, ExamSchedule[]>);

  const levels = Object.keys(groupedExams).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="box-width">
        <div className="page-section">
          <div className="w-full flex items-center justify-center mb-8 flex-col">
            <h2 className="text-center font-bold text-xl ss:text-xll uppercase text-gray-900">
              Examination Timetable
            </h2>
            <p className="heading-p max-w-2xl">
              View the examination schedule for all levels. Please note that
              this timetable is subject to change. Always confirm with your
              department before examination day.
            </p>
          </div>

          {/* Notice Banner */}
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-800">Important Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Examination venues and times may be subject to change. Please check the notice board regularly and arrive at least 30 minutes before your examination.
                </p>
              </div>
            </div>
          </div>

          {/* Exam Schedule by Level */}
          {levels.map((level) => (
            <div key={level} className="mb-10">
              <div className="mb-4">
                <h3 className="text-lg ss:text-xl font-bold text-gray-800 mb-1">
                  {level} Level Examinations
                </h3>
                <div className="bar-style2 mb-2"></div>
              </div>
              <div className="grid items-stretch ss:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupedExams[level].map((exam, index) => (
                  <ExamCard key={exam.id} exam={exam} index={index} />
                ))}
              </div>
            </div>
          ))}

          {/* General Instructions */}
          <div className="mt-10 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Examination Guidelines</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                <span>Arrive at the examination venue at least 30 minutes before the scheduled time.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <span>Bring your valid student ID card and examination card to every examination.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <span>Mobile phones and electronic devices are strictly prohibited in the examination hall.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                <span>Report any discrepancies in the timetable to your class representative or department immediately.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
