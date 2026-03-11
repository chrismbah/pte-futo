/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, isFirebaseConfigured } from "../../config/firebase";
import { doc, getDoc, collection, getDocs, query, limit, where } from "firebase/firestore";
import Footer from "../../components/footer/Footer";
import { motion } from "framer-motion";
import { fadeInVariants3 } from "../../animation/variants";
import { Spinner } from "../../components/loaders/Spinner";
import { notifyUser } from "../../helpers/notifyUser";

interface Collaborator {
  name: string;
  image?: string;
}

interface Project {
  id: string;
  no: number;
  title: string;
  description: string;
  category: "voluntary" | "who" | "personal" | "research" | "community";
  date: string;
  endDate?: string;
  collaborators: Collaborator[];
  image?: string;
  link?: string;
  tags: string[];
  featured: boolean;
  status: "ongoing" | "completed" | "upcoming";
}

const categoryConfig = {
  voluntary: { label: "Voluntary", color: "bg-blue-100 text-blue-800", bgGradient: "from-blue-500 to-blue-600" },
  who: { label: "WHO Project", color: "bg-green-100 text-green-800", bgGradient: "from-green-500 to-green-600" },
  personal: { label: "Personal", color: "bg-purple-100 text-purple-800", bgGradient: "from-purple-500 to-purple-600" },
  research: { label: "Research", color: "bg-orange-100 text-orange-800", bgGradient: "from-orange-500 to-orange-600" },
  community: { label: "Community", color: "bg-teal-100 text-teal-800", bgGradient: "from-teal-500 to-teal-600" },
};

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        console.log("[v0] No projectId provided");
        setError(true);
        setLoading(false);
        return;
      }

      if (!isFirebaseConfigured) {
        console.log("[v0] Firebase not configured");
        setError(true);
        setLoading(false);
        return;
      }

      console.log("[v0] Fetching project with ID:", projectId);

      try {
        setLoading(true);
        setError(false);

        // First try to get project by document ID
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);
        console.log("[v0] Document exists:", docSnap.exists());

        if (docSnap.exists()) {
          const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
          console.log("[v0] Project data loaded:", projectData.title);
          setProject(projectData);

          // Fetch related projects (same category, excluding current)
          try {
            const relatedQuery = query(
              collection(db, "projects"),
              where("category", "==", projectData.category),
              limit(4)
            );
            const relatedSnap = await getDocs(relatedQuery);
            const related = relatedSnap.docs
              .map((d) => ({ id: d.id, ...d.data() } as Project))
              .filter((p) => p.id !== projectId);
            setRelatedProjects(related.slice(0, 3));
          } catch (relatedErr) {
            console.log("[v0] Error fetching related projects:", relatedErr);
            // Don't fail the whole page if related projects fail
          }
        } else {
          console.log("[v0] Document does not exist, trying to find by ID field");
          // If not found by document ID, try to find by querying all projects
          const allProjectsSnap = await getDocs(collection(db, "projects"));
          console.log("[v0] Total projects in collection:", allProjectsSnap.docs.length);
          
          const foundProject = allProjectsSnap.docs.find(d => d.id === projectId);
          if (foundProject) {
            const projectData = { id: foundProject.id, ...foundProject.data() } as Project;
            console.log("[v0] Found project via collection query:", projectData.title);
            setProject(projectData);
          } else {
            console.log("[v0] Project not found in collection");
            setError(true);
          }
        }
      } catch (err) {
        console.error("[v0] Error fetching project:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    window.scrollTo(0, 0);
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner className="w-10 h-10 text-gray-200 animate-spin fill-green1" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="box-width">
          <div className="px-3 py-20 sm:px-10 lg:px-12 sm:py-24 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate("/projects")}
              className="px-6 py-3 bg-green2 text-white rounded-lg font-medium hover:bg-green1 transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const category = categoryConfig[project.category];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="box-width">
          <div className="px-3 py-16 sm:px-10 lg:px-12 sm:py-20">
            <motion.div
              variants={fadeInVariants3}
              initial="initial"
              animate="animate"
              custom={0}
            >
              <button
                onClick={() => navigate("/projects")}
                className="flex items-center gap-2 text-gray-600 hover:text-green2 mb-6 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Projects
              </button>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 ${category.color} rounded-full text-sm font-medium`}>
                  {category.label}
                </span>
                {project.featured && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === "ongoing" ? "bg-blue-100 text-blue-800" :
                  project.status === "completed" ? "bg-green-100 text-green-800" :
                  "bg-orange-100 text-orange-800"
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-balance text-gray-900">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {project.date}
                  {project.endDate && ` - ${project.endDate}`}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="box-width">
        <div className="px-3 py-12 sm:px-10 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={1}
              className="lg:col-span-2"
            >
              {/* Project Image */}
              {project.image && (
                <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-1 bg-green2 rounded-full"></span>
                  About This Project
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-1 bg-green2 rounded-full"></span>
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              variants={fadeInVariants3}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={2}
              className="space-y-6"
            >
              {/* Collaborators */}
              {project.collaborators && project.collaborators.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Collaborators</h3>
                  <ul className="space-y-3">
                    {project.collaborators.map((collab, index) => {
                      // Support both old string format and new object format
                      const name = typeof collab === "string" ? collab : collab.name;
                      const image = typeof collab === "string" ? undefined : collab.image;
                      
                      return (
                        <li key={index} className="flex items-center gap-3 text-gray-700">
                          {image ? (
                            <img 
                              src={image} 
                              alt={name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-green2/10 rounded-full flex items-center justify-center text-green2 font-semibold text-sm">
                              {name.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm font-medium">{name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* External Link */}
              {project.link && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Project Link</h3>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green2 hover:text-green1 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Project
                  </a>
                </div>
              )}

              {/* Related Projects */}
              {relatedProjects.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Related Projects</h3>
                  <div className="space-y-4">
                    {relatedProjects.map((related) => (
                      <button
                        key={related.id}
                        onClick={() => navigate(`/projects/${related.id}`)}
                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 line-clamp-1 text-sm">
                          {related.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{related.date}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Share Project</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      notifyUser("success", "Link copied to clipboard!");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Link
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
