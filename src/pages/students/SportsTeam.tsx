import Footer from "../../components/footer/Footer";
import { motion } from "framer-motion";
import { fadeInVariants3 } from "../../animation/variants";
import { useEffect } from "react";
import placeholder from "../../assets/img/team/placeholder.png";

// =============================================
// TypeScript Interfaces
// =============================================
interface Player {
  name: string;
  position: string;
  level: string;
  jerseyNumber?: number;
  image: string;
}

interface TeamCaptain {
  name: string;
  position: string;
  level: string;
  image: string;
  isCaptain: boolean;
}

interface PlayerCardProps {
  player: Player;
  index: number;
}

// =============================================
// Football Team Data
// =============================================
const teamCaptain: TeamCaptain = {
  name: "Name Here",
  position: "Captain / Midfielder",
  level: "500 Level",
  image: placeholder,
  isCaptain: true,
};

const footballPlayers: Player[] = [
  {
    name: "Name Here",
    position: "Goalkeeper",
    level: "400 Level",
    jerseyNumber: 1,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Right Back",
    level: "300 Level",
    jerseyNumber: 2,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Center Back",
    level: "500 Level",
    jerseyNumber: 4,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Center Back",
    level: "400 Level",
    jerseyNumber: 5,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Left Back",
    level: "300 Level",
    jerseyNumber: 3,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Defensive Midfielder",
    level: "400 Level",
    jerseyNumber: 6,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Central Midfielder",
    level: "500 Level",
    jerseyNumber: 8,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Central Midfielder",
    level: "400 Level",
    jerseyNumber: 10,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Right Winger",
    level: "300 Level",
    jerseyNumber: 7,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Left Winger",
    level: "400 Level",
    jerseyNumber: 11,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Striker",
    level: "500 Level",
    jerseyNumber: 9,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Striker",
    level: "300 Level",
    jerseyNumber: 19,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Substitute Goalkeeper",
    level: "200 Level",
    jerseyNumber: 12,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Substitute Defender",
    level: "300 Level",
    jerseyNumber: 14,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Substitute Midfielder",
    level: "400 Level",
    jerseyNumber: 16,
    image: placeholder,
  },
  {
    name: "Name Here",
    position: "Substitute Forward",
    level: "300 Level",
    jerseyNumber: 17,
    image: placeholder,
  },
];

// Other sports teams
const otherSportsTeams = [
  {
    sport: "Basketball",
    captain: "Name Here",
    membersCount: 12,
  },
  {
    sport: "Volleyball",
    captain: "Name Here",
    membersCount: 14,
  },
  {
    sport: "Table Tennis",
    captain: "Name Here",
    membersCount: 6,
  },
  {
    sport: "Badminton",
    captain: "Name Here",
    membersCount: 4,
  },
  {
    sport: "Athletics",
    captain: "Name Here",
    membersCount: 8,
  },
];

// =============================================
// Captain Card Component
// =============================================
const CaptainCard = ({ captain }: { captain: TeamCaptain }) => (
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
        Team Captain
      </h3>
    </div>
    <div className="p-6 flex flex-col items-center">
      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-green2 overflow-hidden mb-4 bg-gray-100">
        <img
          src={captain.image}
          alt={captain.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
        {captain.name}
      </h4>
      <p className="text-green2 font-semibold">{captain.position}</p>
      <p className="text-gray-500 text-sm">{captain.level}</p>
    </div>
  </motion.div>
);

// =============================================
// Player Card Component
// =============================================
const PlayerCard = ({ player, index }: PlayerCardProps) => (
  <motion.div
    variants={fadeInVariants3}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    custom={index}
    className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
  >
    <div className="p-4 flex flex-col items-center">
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-gray-200 overflow-hidden bg-gray-100">
          <img
            src={player.image}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </div>
        {player.jerseyNumber && (
          <div className="absolute -top-1 -right-1 w-7 h-7 bg-green2 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{player.jerseyNumber}</span>
          </div>
        )}
      </div>
      <h4 className="text-sm sm:text-base font-bold text-gray-900 text-center mt-3">
        {player.name}
      </h4>
      <p className="text-green2 font-semibold text-xs sm:text-sm">{player.position}</p>
      <p className="text-gray-500 text-xs mt-1">{player.level}</p>
    </div>
  </motion.div>
);

// =============================================
// Other Sports Card
// =============================================
const OtherSportsCard = ({ sport, captain, membersCount, index }: { sport: string; captain: string; membersCount: number; index: number }) => (
  <motion.div
    variants={fadeInVariants3}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    custom={index}
    className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-green2 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{sport}</h4>
        <p className="text-xs text-gray-500">Captain: {captain}</p>
        <p className="text-xs text-green2 font-medium">{membersCount} players</p>
      </div>
    </div>
  </motion.div>
);

// =============================================
// Main Component
// =============================================
export default function SportsTeam() {
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
              EBSUMSA Sports Team
            </h2>
            <h3 className="text-gray-700 font-medium text-ss ss:text-sm xlg:text-xs text-center max-w-2xl">
              Meet the athletes representing Medicine and Surgery Department in inter-departmental and inter-faculty competitions
            </h3>
          </div>

          {/* About Sports */}
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
              Sports at EBSUMSA
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Sports is an integral part of life at EBSUMSA. Our athletes compete in various inter-departmental 
              and inter-faculty competitions, bringing pride to the College of Medicine. We believe in the importance 
              of physical fitness and team spirit alongside academic excellence. Join us in cheering for our teams!
            </p>
          </motion.div>

          {/* Football Team Section */}
          <div className="mb-16">
            <h4 className="text-center text-xl font-bold text-gray-900 mb-2">
              Football Team
            </h4>
            <p className="text-center text-gray-500 text-sm mb-8">
              The official EBSUMSA Football Team
            </p>

            {/* Captain */}
            <div className="mb-12">
              <CaptainCard captain={teamCaptain} />
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-2 ss:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {footballPlayers.map((player, index) => (
                <PlayerCard key={`${player.name}-${player.jerseyNumber}`} player={player} index={index + 2} />
              ))}
            </div>
          </div>

          {/* Other Sports Section */}
          <div className="mb-12">
            <h4 className="text-center text-xl font-bold text-gray-900 mb-2">
              Other Sports Teams
            </h4>
            <p className="text-center text-gray-500 text-sm mb-8">
              EBSUMSA also participates in other sporting activities
            </p>

            <div className="grid grid-cols-1 ss:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {otherSportsTeams.map((team, index) => (
                <OtherSportsCard key={team.sport} {...team} index={index + 20} />
              ))}
            </div>
          </div>

          {/* Join Section */}
          <motion.div
            variants={fadeInVariants3}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            custom={30}
            className="bg-green2 rounded-2xl p-6 text-center text-white max-w-2xl mx-auto"
          >
            <h4 className="text-lg font-bold mb-2">Join the Team</h4>
            <p className="text-sm opacity-90 mb-4">
              Interested in representing EBSUMSA in sports? Reach out to the Sports Director!
            </p>
            <a 
              href="mailto:sports@ebsumsa.com" 
              className="inline-block bg-white text-green2 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Contact Sports Director
            </a>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
