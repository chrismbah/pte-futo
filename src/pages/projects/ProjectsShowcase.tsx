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
  category: "voluntary" | "who" | "personal" | "research" | "community";
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

// Category colors and labels
const categoryConfig = {
  voluntary: { label: "Voluntary", color: "bg-blue-100 text-blue-800" },
  who: { label: "WHO Project", color: "bg-green-100 text-green-800" },
  personal: { label: "Personal", color: "bg-purple-100 text-purple-800" },
  research: { label: "Research", color: "bg-orange-100 text-orange-800" },
  community: { label: "Community", color: "bg-teal-100 text-teal-800" },
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
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
          {project.status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.status === "ongoing" ? "bg-blue-100 text-blue-800" :
              project.status === "completed" ? "bg-green-100 text-green-800" :
              "bg-orange-100 text-orange-800"
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
            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
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
// Countdown Timer Component
// =============================================
const CountdownTimer = ({ targetCount, label, duration = 2000 }: { targetCount: number; label: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * targetCount));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
      }
    };
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    
    const element = document.getElementById(`stat-${label.replace(/\s+/g, '-')}`);
    if (element) observer.observe(element);
    
    return () => observer.disconnect();
  }, [targetCount, label, duration, hasAnimated]);

  return (
    <div id={`stat-${label.replace(/\s+/g, '-')}`} className="bg-white rounded-xl p-4 text-center shadow-md">
      <p className="text-2xl sm:text-3xl font-bold text-green2">
        {count.toLocaleString()}+
      </p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
};

// =============================================
// Stats Component with Countdown
// =============================================
const StatsSection = ({ projectCount }: { projectCount: number }) => {
  const stats = [
    { label: "Projects Completed", value: Math.max(projectCount, 25) },
    { label: "Lives Impacted", value: 5000 },
    { label: "WHO Collaborations", value: 8 },
    { label: "Team Members", value: 50 },
  ];

  return (
    <motion.div
      variants={fadeInVariants3}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      custom={1}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
    >
      {stats.map((stat) => (
        <CountdownTimer key={stat.label} targetCount={stat.value} label={stat.label} />
      ))}
    </motion.div>
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
              Discover our voluntary work, WHO collaborations, research initiatives, and community projects
            </h3>
          </div>

          {/* Stats */}
          <StatsSection projectCount={projects.length} />

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
                  From WHO-sponsored health programs to voluntary medical outreaches, our students actively 
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
