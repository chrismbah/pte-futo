import Footer from "../../components/footer/Footer";
import { motion } from "framer-motion";
import { fadeInVariants3 } from "../../animation/variants";
import { useEffect } from "react";
import placeholder from "../../assets/img/team/placeholder.png";

// =============================================
// TypeScript Interfaces
// =============================================
interface PressMember {
  name: string;
  role: string;
  level: string;
  image: string;
  specialty?: string;
}

interface PressMemberCardProps {
  member: PressMember;
  index: number;
}

// =============================================
// Press Team Data
// =============================================
const editorInChief: PressMember = {
  name: "Name Here",
  role: "Editor-in-Chief",
  level: "500 Level",
  image: placeholder,
  specialty: "News & Editorial",
};

const pressMembers: PressMember[] = [
  {
    name: "Name Here",
    role: "Deputy Editor",
    level: "500 Level",
    image: placeholder,
    specialty: "Feature Articles",
  },
  {
    name: "Name Here",
    role: "News Editor",
    level: "400 Level",
    image: placeholder,
    specialty: "Campus News",
  },
  {
    name: "Name Here",
    role: "Social Media Manager",
    level: "400 Level",
    image: placeholder,
    specialty: "Digital Content",
  },
  {
    name: "Name Here",
    role: "Graphics Designer",
    level: "400 Level",
    image: placeholder,
    specialty: "Visual Design",
  },
  {
    name: "Name Here",
    role: "Photographer",
    level: "300 Level",
    image: placeholder,
    specialty: "Event Photography",
  },
  {
    name: "Name Here",
    role: "Video Editor",
    level: "400 Level",
    image: placeholder,
    specialty: "Video Production",
  },
  {
    name: "Name Here",
    role: "Reporter",
    level: "300 Level",
    image: placeholder,
    specialty: "Academic News",
  },
  {
    name: "Name Here",
    role: "Reporter",
    level: "300 Level",
    image: placeholder,
    specialty: "Sports News",
  },
  {
    name: "Name Here",
    role: "Reporter",
    level: "200 Level",
    image: placeholder,
    specialty: "Health News",
  },
  {
    name: "Name Here",
    role: "Content Writer",
    level: "400 Level",
    image: placeholder,
    specialty: "Blog Articles",
  },
];

// =============================================
// Editor in Chief Card Component
// =============================================
const EditorInChiefCard = ({ member }: { member: PressMember }) => (
  <motion.div
    variants={fadeInVariants3}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    custom={1}
    className="w-full max-w-md mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border-2 border-green2"
  >
    <div className="bg-gradient-to-r from-green2 to-green1 p-4">
      <h3 className="text-white text-center text-lg font-bold uppercase tracking-wide">
        Editor-in-Chief
      </h3>
    </div>
    <div className="p-6 flex flex-col items-center">
      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-green2 overflow-hidden mb-4 bg-gray-100">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
        {member.name}
      </h4>
      <p className="text-green2 font-semibold">{member.level}</p>
      {member.specialty && (
        <p className="text-gray-500 text-sm mt-1">{member.specialty}</p>
      )}
    </div>
  </motion.div>
);

// =============================================
// Press Member Card Component
// =============================================
const PressMemberCard = ({ member, index }: PressMemberCardProps) => (
  <motion.div
    variants={fadeInVariants3}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    custom={index}
    className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
  >
    <div className="p-4 flex flex-col items-center">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-gray-200 overflow-hidden mb-3 bg-gray-100">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h4 className="text-sm sm:text-base font-bold text-gray-900 text-center">
        {member.name}
      </h4>
      <p className="text-green2 font-semibold text-xs sm:text-sm">{member.role}</p>
      <p className="text-gray-500 text-xs mt-1">{member.level}</p>
      {member.specialty && (
        <span className="mt-2 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
          {member.specialty}
        </span>
      )}
    </div>
  </motion.div>
);

// =============================================
// Main Component
// =============================================
export default function PressTeam() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="box-width">
        <div className="px-3 py-20 sm:px-10 lg:px-12 sm:py-24">
          {/* Header */}
          <div className="flex items-center justify-center flex-col py-6 mb-8">
            <h2>
              <div className="bar-style" />
              EBSUMSA Press Team
            </h2>
            <h3 className="text-gray-700 font-medium text-ss ss:text-sm xlg:text-xs text-center max-w-2xl">
              The voice of EBSUMSA - Documenting our journey, sharing our stories
            </h3>
          </div>

          {/* About Press */}
          <motion.div
            variants={fadeInVariants3}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={0}
            className="bg-white rounded-2xl shadow-md p-6 mb-12 max-w-3xl mx-auto"
          >
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-1 bg-green2 rounded-full"></span>
              About EBSUMSA Press
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              The EBSUMSA Press Team is responsible for documenting the activities and achievements of medical students 
              at EBSU. We cover news, events, and stories that matter to our community. From academic achievements to 
              social events, from health outreaches to sports competitions - we tell the stories that shape our medical 
              school experience. Follow us on social media for the latest updates!
            </p>
          </motion.div>

          {/* What We Do */}
          <motion.div
            variants={fadeInVariants3}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={1}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h5 className="font-bold text-gray-900 text-sm">News Coverage</h5>
              <p className="text-xs text-gray-500 mt-1">Campus events & announcements</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h5 className="font-bold text-gray-900 text-sm">Photography</h5>
              <p className="text-xs text-gray-500 mt-1">Capturing memories</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h5 className="font-bold text-gray-900 text-sm">Video Production</h5>
              <p className="text-xs text-gray-500 mt-1">Event highlights & vlogs</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-md">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h5 className="font-bold text-gray-900 text-sm">Social Media</h5>
              <p className="text-xs text-gray-500 mt-1">Digital engagement</p>
            </div>
          </motion.div>

          {/* Editor in Chief */}
          <div className="mb-12">
            <EditorInChiefCard member={editorInChief} />
          </div>

          {/* Press Team Grid */}
          <div className="mb-12">
            <h4 className="text-center text-lg font-bold text-gray-900 mb-6">
              Press Team Members
            </h4>
            <div className="grid grid-cols-2 ss:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pressMembers.map((member, index) => (
                <PressMemberCard key={`${member.name}-${member.role}`} member={member} index={index + 2} />
              ))}
            </div>
          </div>

          {/* Social Media Links */}
          <motion.div
            variants={fadeInVariants3}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={15}
            className="bg-white rounded-2xl shadow-md p-6 mb-8 max-w-2xl mx-auto"
          >
            <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">Follow EBSUMSA Press</h4>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#" 
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Instagram</span>
              </a>
              <a 
                href="#" 
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">X (Twitter)</span>
              </a>
            </div>
          </motion.div>

          {/* Join Section */}
          <motion.div
            variants={fadeInVariants3}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={20}
            className="bg-green2 rounded-2xl p-6 text-center text-white max-w-2xl mx-auto"
          >
            <h4 className="text-lg font-bold mb-2">Join the Press Team</h4>
            <p className="text-sm opacity-90 mb-4">
              Have a passion for writing, photography, or content creation? We'd love to have you on the team!
            </p>
            <a 
              href="mailto:press@ebsumsa.com" 
              className="inline-block bg-white text-green2 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Apply to Join
            </a>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
