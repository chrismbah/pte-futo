import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import NotFound from "../pages/error/404/NotFound";
import LogoSpinner from "../components/loaders/FullLogoSpinner";
import { Navbar } from "../components/navbar/Navbar";
import ProtectedRoute from "./ProtectedRoute";


const AppRoutes = () => {
  const Login = lazy(() => import("../pages/auth/login"));
  const SignUp = lazy(() => import("../pages/auth/signup"));
  const Home = lazy(() => import("../pages/home/Home"));
  const CalculateGPA = lazy(
    () => import("../pages/academics/gpa/CalculateGPA")
  );
  const CourseOutline = lazy(
    () => import("../pages/academics/course-outlines/CourseOutline")
  );
  const CoursesOutline = lazy(
    () => import("../pages/academics/course-outlines/CoursesOutline")
  );
  const CourseInfo = lazy(
    () => import("../pages/academics/course-outlines/CourseInfo")
  );
  const LearningResources = lazy(
    () => import("../pages/academics/learning-resources/LearningResources")
  );
  const LearningResourcesCourses = lazy(
    () =>
      import("../pages/academics/learning-resources/LearningResourcesCourses")
  );
  const LearningResourcesContent = lazy(
    () =>
      import("../pages/academics/learning-resources/LearningResourcesContent")
  );
  const ExamTimetable = lazy(
    () => import("../pages/academics/exam-timetable/ExamTimetable")
  );
  const Blog = lazy(() => import("../pages/misc/blog/Blog"));
  const BlogPost = lazy(() => import("../pages/misc/blog/post/BlogPost"));
  const ProjectTeam = lazy(() => import("../pages/students/ProjectTeam"));
  const ClassReps = lazy(() => import("../pages/students/ClassReps"));
  
  // New EBSUMSA pages
  const EbsumsaTeam = lazy(() => import("../pages/students/EbsumsaTeam"));
  const SportsTeam = lazy(() => import("../pages/students/SportsTeam"));
  const PressTeam = lazy(() => import("../pages/students/PressTeam"));
  const ProjectsShowcase = lazy(() => import("../pages/projects/ProjectsShowcase"));
  const ProjectDetails = lazy(() => import("../pages/projects/ProjectDetails"));
  
  const AboutUs = lazy(() => import("../pages/about/AboutUs"));
  const PhilosophyAndObjectives = lazy(() => import("../pages/about/P&A"));
  const Admission = lazy(() => import("../pages/about/Admission"));
  const Dashboard = lazy(() => import("../pages/user/dashboard/Dashboard"));
  const StudentProfile = lazy(
    () => import("../pages/user/profile/StudentProfile")
  );
  const DashboardGPACalculator = lazy(
    () =>
      import("../pages/user/dashboard/components/gpa-calculator/GPACalculator")
  );
  const DashboardCourseOutlines = lazy(
    () =>
      import(
        "../pages/user/dashboard/components/course-outlines/CourseOutlines"
      )
  );
  const DashboardLearningResources = lazy(
    () =>
      import(
        "../pages/user/dashboard/components/learning-resources/LearningResources"
      )
  );
  const IDCardRegistration = lazy(
    () => import("../pages/user/id-card/IDCardRegistration")
  );
  const AdminDashboard = lazy(
    () => import("../pages/admin/AdminDashboard")
  );
  const ResourcesPage = lazy(
    () => import("../pages/user/resources/ResourcesPage")
  );

  return (
    <>
      <Navbar />
      <Suspense fallback={<LogoSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/calculate-gpa" element={<CalculateGPA />} />
          <Route path="/course-outlines" element={<CourseOutline />} />
          <Route path="/course-outlines/:level" element={<CoursesOutline />} />
          <Route path="/course-outlines/:level/:id" element={<CourseInfo />} />
          <Route
            path="/learning-resources"
            element={<LearningResources />}
          />
          <Route
            path="/learning-resources/:level"
            element={<LearningResourcesCourses />}
          />{" "}
          <Route
            path={"/learning-resources/:level/:id/:courseTitle"}
            element={<LearningResourcesContent />}
          />
          <Route path="/exam-timetable" element={<ExamTimetable />} />
          <Route path="/blog" element={<Blog />} />
          <Route
            path="/blog/posts/:title/:postID/:postType"
            element={<BlogPost />}
          />
          <Route path="/students/project-team" element={<ProjectTeam />} />
          <Route
            path="/students/class-representatives"
            element={<ClassReps />}
          />
          
          {/* New EBSUMSA routes */}
          <Route path="/ebsumsa/team" element={<EbsumsaTeam />} />
          <Route path="/ebsumsa/sports" element={<SportsTeam />} />
          <Route path="/ebsumsa/press" element={<PressTeam />} />
          <Route path="/projects" element={<ProjectsShowcase />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          
          <Route path="/about/about-us" element={<AboutUs />} />
          <Route
            path="/about/philosophy-and-objectives"
            element={<PhilosophyAndObjectives />}
          />
          <Route path="/about/admission" element={<Admission />} />
          <Route path="/gpa-calculator" element={<CalculateGPA />} />
          <Route
            path="/u/profile"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/u/gpa-calculator"
            element={
              <ProtectedRoute>
                <DashboardGPACalculator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/u/course-outlines"
            element={
              <ProtectedRoute>
                <DashboardCourseOutlines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/u/learning-resources"
            element={
              <ProtectedRoute>
                <DashboardLearningResources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />{" "}
              </ProtectedRoute>
            }
          />
          <Route
            path="/u/id-card"
            element={
              <ProtectedRoute>
                <IDCardRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/u/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};
export default AppRoutes;
