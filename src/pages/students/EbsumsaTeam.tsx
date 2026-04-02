import Footer from "../../components/footer/Footer";
import { motion } from "framer-motion";
import { fadeInVariants3 } from "../../animation/variants";
import { useEffect, useState } from "react";
import placeholder from "../../assets/img/team/placeholder.png";
import { supabase } from "../../config/supabase";
import { IoCall, IoMail, IoLogoGooglePlaystore } from "react-icons/io5";
import { HiExternalLink } from "react-icons/hi";

interface ExecutiveMember {
  name: string;
  title: string;
  image: string;
  phone?: string;
  bio?: string;
}

const defaultPresidentData: ExecutiveMember = {
  name: "Name Here",
  title: "President",
  image: placeholder,
  phone: "",
  bio: "Leading EBSUMSA with vision and dedication to advance medical student welfare and professional development.",
};

const defaultExecutiveMembers: ExecutiveMember[] = [
  { name: "Name Here", title: "Vice President",           image: placeholder, phone: "" },
  { name: "Name Here", title: "General Secretary",        image: placeholder, phone: "" },
  { name: "Name Here", title: "Financial Secretary",      image: placeholder, phone: "" },
  { name: "Name Here", title: "Treasurer",                image: placeholder, phone: "" },
  { name: "Name Here", title: "Public Relations Officer", image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Socials",      image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Academics",    image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Welfare",      image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Sports",       image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Health",       image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Research",     image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Projects",     image: placeholder, phone: "" },
  { name: "Name Here", title: "Chief Whip",               image: placeholder, phone: "" },
  { name: "Name Here", title: "Year One Representative",  image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Logistics",   image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Legal",       image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of ICT",         image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Publicity",   image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Finance",     image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Complaints",  image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Protocol",    image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Community",   image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Strategy",    image: placeholder, phone: "" },
  { name: "Name Here", title: "Director of Press",       image: placeholder, phone: "" },
];

const DEFAULT_DRIVE = "https://drive.google.com/file/d/1Vv_k_nvjAZ1Wi8QnpFa5wlsWCsns7918/view?usp=drivesdk";

// ─── President Card ────────────────────────────────────────────────────────
const PresidentCard = ({ member }: { member: ExecutiveMember }) => (
  <motion.div
    variants={fadeInVariants3}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    custom={1}
    className="relative w-full max-w-lg mx-auto overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100"
  >
    {/* Top accent bar */}
    <div className="h-2 bg-green2 w-full" />

    <div className="flex flex-col sm:flex-row items-center gap-6 p-8">
      {/* Photo */}
      <div className="relative flex-shrink-0">
        <div className="w-36 h-36 rounded-2xl overflow-hidden ring-4 ring-green2/20 shadow-lg">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="absolute -bottom-2 -right-2 bg-green2 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wide">
          President
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs font-bold text-green2 uppercase tracking-widest mb-1">EBSUMSA President</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-balance leading-tight">
          {member.name}
        </h3>
        {member.bio && (
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">{member.bio}</p>
        )}
        {member.phone && (
          <a
            href={`tel:${member.phone}`}
            className="mt-4 inline-flex items-center gap-2 bg-green2/10 text-green2 hover:bg-green2 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
          >
            <IoCall className="text-base" />
            {member.phone}
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

// ─── Executive Card ────────────────────────────────────────────────────────
const ExecutiveCard = ({ member, index }: { member: ExecutiveMember; index: number }) => (
  <motion.div
    variants={fadeInVariants3}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    custom={index}
    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
  >
    {/* Image */}
    <div className="relative h-44 bg-gray-100 overflow-hidden">
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      {/* Title badge */}
      <div className="absolute bottom-3 left-3 right-3">
        <span className="inline-block bg-green2 text-white text-xs font-bold px-2.5 py-1 rounded-lg leading-tight">
          {member.title}
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="p-4">
      <h4 className="font-bold text-gray-900 text-sm leading-snug">
        {member.name}
      </h4>
      {member.phone ? (
        <a
          href={`tel:${member.phone}`}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-green2 transition-colors"
        >
          <IoCall className="text-xs flex-shrink-0" />
          {member.phone}
        </a>
      ) : (
        <p className="mt-1.5 text-xs text-gray-300 italic">Phone not set</p>
      )}
    </div>
  </motion.div>
);

// ─── Drive CTA Banner ──────────────────────────────────────────────────────
const DriveCtaBanner = ({ url }: { url: string }) => (
  <motion.div
    variants={fadeInVariants3}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    custom={5}
    className="relative overflow-hidden rounded-3xl bg-green2 px-6 py-10 sm:px-12 text-center"
  >
    {/* Decorative circles */}
    <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
    <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
    <div className="absolute top-4 right-12 w-16 h-16 rounded-full bg-white/5" />

    <div className="relative z-10">
      <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
        <IoLogoGooglePlaystore className="text-sm" />
        Full Appointee List
      </div>
      <h3 className="text-white text-2xl sm:text-3xl font-extrabold text-balance mb-3">
        Meet Every Member of the EBSUMSA Family
      </h3>
      <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
        Our executive spotlight features only a few of the remarkable individuals serving EBSUMSA. Access the complete directory of every appointed official.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2.5 bg-white text-green2 hover:bg-gray-50 font-bold px-6 py-3 rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
      >
        <HiExternalLink className="text-lg" />
        View All Appointees
      </a>
    </div>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────────
export default function EbsumsaTeam() {
  const [presidentData, setPresidentData]       = useState<ExecutiveMember>(defaultPresidentData);
  const [executiveMembers, setExecutiveMembers] = useState<ExecutiveMember[]>(defaultExecutiveMembers);
  const [driveUrl, setDriveUrl]                 = useState(DEFAULT_DRIVE);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Load executive overrides from Supabase
    supabase
      .from("team_images")
      .select("member_id, image_url, name, role, extra")
      .eq("team_type", "executive")
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return;
        const map: Record<string, { image_url?: string; name?: string; role?: string; extra?: string }> = {};
        data.forEach((row) => { map[row.member_id] = row; });

        const presRow = map["president"];
        if (presRow) {
          setPresidentData((prev) => ({
            ...prev,
            name:  presRow.name      || prev.name,
            title: presRow.role      || prev.title,
            image: presRow.image_url || prev.image,
            phone: presRow.extra     || prev.phone || "",
          }));
        }

        setExecutiveMembers((prev) =>
          prev.map((m, idx) => {
            const patch = map[`exec-${idx}`];
            if (!patch) return m;
            return {
              ...m,
              name:  patch.name      || m.name,
              title: patch.role      || m.title,
              image: patch.image_url || m.image,
              phone: patch.extra     || m.phone,
            };
          })
        );
      });

    // Load drive URL
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "appointees_drive_url")
      .single()
      .then(({ data }) => {
        if (data?.value) setDriveUrl(data.value);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="box-width">
          <div className="px-4 sm:px-10 lg:px-12 py-16 sm:py-20 text-center">
            <motion.div
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={0}
            >
              <span className="inline-block bg-green2/10 text-green2 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
                EBSUMSA Leadership
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 text-balance leading-tight mb-4">
                Executive Team
              </h2>
              <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Meet the dedicated leaders of the Ebonyi State University Medical Students' Association — working tirelessly for your academic and professional growth.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="box-width">
        <div className="px-4 sm:px-10 lg:px-12 py-12 sm:py-16 space-y-16">

          {/* President Spotlight */}
          <section>
            <div className="text-center mb-8">
              <h3 className="text-xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
                <span className="h-px flex-1 max-w-[80px] bg-gray-200" />
                Presidential Office
                <span className="h-px flex-1 max-w-[80px] bg-gray-200" />
              </h3>
            </div>
            <PresidentCard member={presidentData} />
          </section>

          {/* Executive Members Grid */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Executive Members</h3>
                <p className="text-xs text-gray-400 mt-1">{executiveMembers.length} officials</p>
              </div>
              <a
                href={driveUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-green2 hover:text-green1 transition-colors border border-green2/30 hover:border-green2 px-4 py-2 rounded-xl"
              >
                <HiExternalLink className="text-sm" />
                View All Appointees
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {executiveMembers.map((member, index) => (
                <ExecutiveCard key={member.title} member={member} index={index + 2} />
              ))}
            </div>
          </section>

          {/* Drive CTA Banner */}
          <DriveCtaBanner url={driveUrl} />

          {/* About + Contact */}
          <section className="grid sm:grid-cols-2 gap-6">
            <motion.div
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={2}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-green2 rounded-full" />
                <h4 className="text-base font-extrabold text-gray-900">About EBSUMSA</h4>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                The Ebonyi State University Medical Students' Association (EBSUMSA) is the umbrella body for all medical students at EBSU College of Medicine. We foster academic excellence, professional development, and the overall welfare of medical students through seminars, health outreaches, sports, and social events.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={3}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-green2 rounded-full" />
                  <h4 className="text-base font-extrabold text-gray-900">Get In Touch</h4>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  Have questions or suggestions? Reach out to EBSUMSA leadership directly.
                </p>
              </div>
              <a
                href="mailto:ebsumsa102@gmail.com"
                className="inline-flex items-center gap-2 bg-green2/10 hover:bg-green2 text-green2 hover:text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-fit"
              >
                <IoMail className="text-base" />
                <span>ebsumsa102@gmail.com</span>
                <HiExternalLink className="text-sm" />
              </a>
            </motion.div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}
