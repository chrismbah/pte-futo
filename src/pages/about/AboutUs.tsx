import Footer from "../../components/footer/Footer";
import { InstagramIcon } from "../../components/icons/socials/InstagramIcon";
import { XIcon } from "../../components/icons/socials/XIcon";
import { YouTubeIcon } from "../../components/icons/socials/YouTubeIcon";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/ebsumsaofficial?utm_source=qr&igsh=MW5mMWlrY3g4c3lxaQ==",
    icon: InstagramIcon,
    accent: "#E1306C",
    bg: "hover:border-[#E1306C]",
    iconBg: "bg-[#E1306C]",
    handle: "@ebsumsaofficial",
    cta: "Follow on Instagram",
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/Ebsumsaofficial",
    icon: XIcon,
    accent: "#000000",
    bg: "hover:border-black",
    iconBg: "bg-black",
    handle: "@Ebsumsaofficial",
    cta: "Follow on X",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@ebsumsatv?si=qWJTfD2Z4L61wrBo",
    icon: YouTubeIcon,
    accent: "#FF0000",
    bg: "hover:border-[#FF0000]",
    iconBg: "bg-[#FF0000]",
    handle: "@ebsumsatv",
    cta: "Watch on YouTube",
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1280px] w-full mx-auto flex items-center justify-center px-4">
        <div className="px-4 sm:px-14 sm:py-10 py-6 my-16 ss:mt-20 sm:my-24 bg-white shadow rounded-lg w-full">
          {/* About Intro */}
          <h2 className="mb-4">
            <div className="bar-style" />
            About EBSUMSA
          </h2>
          <p className="text-sm sm:text-xs text-gray-700 leading-7 mb-8">
            The Ebonyi State University Medical Students Association (EBSUMSA) is the official representative body for all medical students at Ebonyi State University, Abakaliki. Guided by our motto, <span className="font-semibold text-gray-800">"Pro Deo et Humanitate"</span> (For God and Humanity), we are committed to transforming public health and making a meaningful impact in our immediate community and beyond.
          </p>

          {/* Vision & Mission Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Vision */}
            <div className="rounded-2xl border border-green-100 bg-green-50 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-green-800">Our Vision</h4>
              </div>
              <p className="text-xs text-green-900 leading-6">
                To position medical students of EBSU as leaders on the global healthcare landscape through excellence, innovation, and compassion.
              </p>
            </div>

            {/* Mission */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-amber-800">Our Mission</h4>
              </div>
              <p className="text-xs text-amber-900 leading-6">
                To advance medical education by fostering clinical excellence, promoting cutting-edge research, driving public health outreach, and connecting students with professional development opportunities.
              </p>
            </div>
          </div>

          {/* What We Do */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-green-600" />
              What We Do
            </h4>
            <p className="text-sm sm:text-xs text-gray-700 leading-7">
              EBSUMSA serves as a vital bridge between students, faculty, and the wider healthcare community. We organize clinical skills workshops, research forums, public health outreaches, and peer-support programs. Through strategic partnerships with healthcare investors and institutions, we promote ethical practice, leadership, and access to internships and collaborative projects that prepare our members for global impact.
            </p>
          </div>

          {/* Social Media Links */}
          <div className="border-t border-gray-100 pt-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Connect with us
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${social.bg}`}
                  >
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${social.iconBg} flex-shrink-0`}>
                      <Icon className="w-5 h-5 fill-white" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-gray-900 truncate">{social.label}</span>
                      <span className="text-xs text-gray-500 truncate">{social.handle}</span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors ml-auto flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

