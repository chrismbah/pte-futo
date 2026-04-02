import Footer from "../../components/footer/Footer";
import { motion } from "framer-motion";
import { fadeInVariants3 } from "../../animation/variants";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, isFirebaseConfigured } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Spinner } from "../../components/loaders/Spinner";

// =============================================
// TypeScript Interfaces
// =============================================
interface Collaborator {
  name: string;
  image?: string;
}

interface Project {
  id: string;
  no?: number;
  title: string;
  description: string;
  category: "voluntary" | "ngo" | "personal" | "research" | "community" | "fun_activities";
  date: string;
  endDate?: string;
  collaborators?: Collaborator[] | string[];
  image?: string;
  link?: string;
  tags: string[];
  featured?: boolean;
  status?: "ongoing" | "completed" | "upcoming";
}

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

// Category colors and labels — all use brand green shades
const categoryConfig = {
  voluntary:      { label: "Voluntary",         color: "bg-green1/10 text-green1" },
  ngo:            { label: "NGO Collaboration",  color: "bg-green3/10 text-green3" },
  personal:       { label: "Personal",           color: "bg-green2/10 text-green2" },
  research:       { label: "Research",           color: "bg-green5/10 text-green5" },
  community:      { label: "Community",          color: "bg-green4/10 text-green4" },
  fun_activities: { label: "Fun Activities",     color: "bg-yellow1/20 text-green3" },
};

// =============================================
// Project Card Component
// =============================================
const ProjectCard = ({ project, index, onClick }: ProjectCardProps) => {
  const handleClick = () => {
    console.log("[v0] Clicking project card, ID:", project.id, "Title:", project.title);
    onClick();
  };
  
  return (
  <motion.div
    variants={fadeInVariants3}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    custom={index}
    onClick={handleClick}
    className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
      project.featured ? "border-l-4 border-green2" : ""
    } hover:-translate-y-1`}
  >
    {project.image && (
      <div className="h-40 overflow-hidden">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
      </div>
    )}
    <div className="p-5">
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            categoryConfig[project.category]?.color || "bg-gray-100 text-gray-800"
          }`}
        >
          {categoryConfig[project.category]?.label || project.category}
        </span>
        <div className="flex gap-2">
          {project.featured && (
            <span className="px-2 py-1 bg-yellow1/20 text-green3 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
          {project.status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.status === "ongoing"   ? "bg-green5/10 text-green5" :
              project.status === "completed" ? "bg-green1/10 text-green1" :
              "bg-green3/10 text-green3"
            }`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {project.title}
      </h3>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>

      <div className="flex flex-wrap gap-1 mb-4">
        {project.tags?.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-green1/10 text-green1 rounded text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {project.date}
          {project.endDate && ` - ${project.endDate}`}
        </span>
        <span className="text-green2 hover:text-green1 text-sm font-medium flex items-center gap-1">
          View Details
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>

{project.collaborators && project.collaborators.length > 0 && (
  <div className="mt-3 pt-3 border-t border-gray-100">
  <p className="text-xs text-gray-500">
  <span className="font-medium">Collaborators:</span>{" "}
  {project.collaborators.slice(0, 2).map((c, i) => {
    const name = typeof c === "string" ? c : c.name;
    return i === 0 ? name : `, ${name}`;
  })}
  {project.collaborators.length > 2 &&
  ` +${project.collaborators.length - 2} more`}
  </p>
  </div>
  )}
</div>
  </motion.div>
  );
};
  
// =============================================
// Stat Card with count-up animation
// =============================================
const statMeta = [
  {
    label: "Projects Completed",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    gradient: "from-green1 to-green2",
    glow: "shadow-green-200",
  },
  {
    label: "Lives Impacted",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    gradient: "from-green2 to-green3",
    glow: "shadow-green-200",
  },
  {
    label: "NGO Collaborations",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    gradient: "from-green3 to-green1",
    glow: "shadow-green-200",
  },
  {
    label: "Team Members",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    gradient: "from-green5 to-green1",
    glow: "shadow-green-200",
  },
];

const CountdownTimer = ({ targetCount, label, duration = 2200, index }: { targetCount: number; label: string; duration?: number; index: number }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const meta = statMeta[index] ?? statMeta[0];

  useEffect(() => {
    if (hasAnimated) return;
    const id = `stat-${label.replace(/\s+/g, '-')}`;
    const startAnimation = () => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * targetCount));
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setHasAnimated(true);
        }
      };
      requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && !hasAnimated) startAnimation(); },
      { threshold: 0.4 }
    );
    const el = document.getElementById(id);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [targetCount, label, duration, hasAnimated]);

  return (
    <motion.div
      id={`stat-${label.replace(/\s+/g, '-')}`}
      variants={fadeInVariants3}
      custom={index + 1}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 shadow-lg ${meta.glow} hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center`}
    >
      {/* Top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.gradient} rounded-t-2xl`} />

      {/* Icon badge */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center mb-3 shadow-md`}>
        {meta.icon}
      </div>

      {/* Count */}
      <p className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent leading-none`}>
        {count.toLocaleString()}+
      </p>

      {/* Label */}
      <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-2 leading-tight">{label}</p>
    </motion.div>
  );
};

// =============================================
// Stats Section
// =============================================
const StatsSection = () => {
  const stats = [
    { label: "Projects Completed", value: 200 },
    { label: "Lives Impacted",     value: 20000 },
    { label: "NGO Collaborations", value: 40 },
    { label: "Team Members",       value: 50 },
  ];

  return (
    <div className="mb-14">
      {/* Section header */}
      <motion.div
        variants={fadeInVariants3}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={0}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green1/10 text-green1 text-xs font-bold rounded-full uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green1 animate-pulse" />
          Our Impact in Numbers
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-balance">
          Making a Real Difference
        </h2>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          Every number tells a story of dedication, service, and community care.
        </p>
      </motion.div>

      <motion.div
        variants={fadeInVariants3}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={1}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5"
      >
        {stats.map((stat, i) => (
          <CountdownTimer key={stat.label} targetCount={stat.value} label={stat.label} index={i} />
        ))}
      </motion.div>
    </div>
  );
};

// =============================================
// Main Component
// =============================================
export default function ProjectsShowcase() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      if (!isFirebaseConfigured) {
        console.log("[v0] Firebase not configured");
        setLoading(false);
        return;
      }

      try {
        console.log("[v0] Fetching all projects from Firestore...");
        // Simple query without ordering to avoid index requirements
        const snapshot = await getDocs(collection(db, "projects"));
        console.log("[v0] Found projects:", snapshot.docs.length);
        
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        
        // Sort client-side instead
        projectsData.sort((a, b) => {
          const dateA = a.date || "";
          const dateB = b.date || "";
          return dateB.localeCompare(dateA);
        });
        
        setProjects(projectsData);
        console.log("[v0] Projects loaded:", projectsData.map(p => ({ id: p.id, title: p.title })));
      } catch (error) {
        console.error("[v0] Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    window.scrollTo(0, 0);
  }, []);

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.category === filter);

  const featuredProjects = projects.filter((p) => p.featured);

  return (
    <div className="min-h-screen bg-white">
      <div className="box-width">
        <div className="px-3 py-20 sm:px-10 lg:px-12 sm:py-24">
          {/* Header */}
          <div className="flex items-center justify-center flex-col py-6 mb-8">
            <h2>
              <div className="bar-style" />
              Projects Showcase
            </h2>
            <h3 className="text-gray-700 font-medium text-ss ss:text-sm xlg:text-xs text-center max-w-2xl">
              Discover our voluntary work, NGO collaborations, research initiatives, community projects and fun activities
            </h3>
          </div>

          {/* Stats */}
          <StatsSection />

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="w-10 h-10 text-gray-200 animate-spin fill-green1" />
            </div>
          ) : (
            <>
              {/* About Section */}
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
                  Our Impact
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  At EBSUMSA, we believe in giving back to our community through various initiatives. 
                  From NGO-sponsored health programs to voluntary medical outreaches and fun activities, our students actively 
                  participate in projects that make a real difference. This page showcases our collective 
                  efforts and achievements in health promotion, research, and community service.
                </p>
              </motion.div>

              {/* Featured Projects */}
              {featuredProjects.length > 0 && (
                <div className="mb-12">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Featured Projects
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredProjects.map((project, index) => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        index={index}
                        onClick={() => navigate(`/projects/${project.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

          {/* Filter Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">All Projects</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filter === "all"
                        ? "bg-green2 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    All
                  </button>
{Object.entries(categoryConfig).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          filter === key
                            ? "bg-green2 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {value.label}
                      </button>
                    ))}
                </div>
              </div>

          {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredProjects.map((project, index) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    index={index + 5}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  />
                ))}
              </div>

          {filteredProjects.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No projects found in this category.</p>
                </div>
              )}

              {/* Call to Action */}
              <motion.div
                variants={fadeInVariants3}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                custom={20}
                className="bg-green2 rounded-2xl p-6 text-center text-white max-w-2xl mx-auto"
              >
                <h4 className="text-lg font-bold mb-2">Want to Contribute?</h4>
                <p className="text-sm opacity-90 mb-4">
                  Have a project idea or want to share your work? Contact us to have your project featured!
                </p>
                <a
                  href="mailto:projects@ebsumsa.com"
                  className="inline-block bg-white text-green2 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Submit Your Project
                </a>
              </motion.div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
