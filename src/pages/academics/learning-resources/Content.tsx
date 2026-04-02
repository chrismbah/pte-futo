/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { supabase, STORAGE_BUCKETS, getPublicUrl } from "../../../config/supabase";
import { useParams, Link, useLocation } from "react-router-dom";
import { useLearningResourcesContext } from "../../../context/LearningResources";
import { Spinner } from "../../../components/loaders/Spinner";
import { ContentCard } from "./ContentCard";
import fileSearch from "../../../assets/svg/illustrations/fileSearch.svg";
import { FileMetadata } from "../../../models/academics/learning-resources";
import book from "../../../assets/svg/illustrations/reading.svg";
import { motion } from "framer-motion";
import { fadeInVariants1 } from "../../../animation/variants";
import { db, isFirebaseConfigured } from "../../../config/firebase";
import { collection, getDocs, query, where, and } from "firebase/firestore";
import { useGetUserInfo } from "../../../hooks/auth/useGetUserInfo";
import { LockKeyhole } from "lucide-react";

interface AdminMaterial {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  courseCode: string;
  level: string;
  semester: string;
  resourceType: string;
}

export default function Content() {
  const { level, id } = useParams();
  const { resourcesType } = useLearningResourcesContext();
  const { user } = useGetUserInfo();
  const location = useLocation();
  
  // Current page URL to redirect back after login
  const currentPath = location.pathname;

  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchFiles = async () => {
    const folderPath = `levels/${level}/${id}/${resourcesType}`;
    
    try {
      setError(false);
      setLoading(true);
      
      let fileList: FileMetadata[] = [];

      // 1. First fetch from Firestore (admin-uploaded materials with metadata)
      if (isFirebaseConfigured) {
        try {
          const q = query(
            collection(db, "learningMaterials"),
            and(
              where("level", "==", level),
              where("courseCode", "==", id),
              where("resourceType", "==", resourcesType)
            )
          );
          const snapshot = await getDocs(q);
          const adminMaterials = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as AdminMaterial[];

          // Add admin materials to file list
          adminMaterials.forEach(material => {
            fileList.push({
              name: material.title || material.fileName,
              path: material.filePath,
              size: material.fileSize || 0,
              url: material.fileUrl,
              description: material.description,
            });
          });
        } catch (firestoreError) {
          console.error("Error fetching from Firestore:", firestoreError);
        }
      }

      // 2. Also fetch directly from Supabase Storage (for backwards compatibility)
      try {
        const { data, error: listError } = await supabase.storage
          .from(STORAGE_BUCKETS.LEARNING_RESOURCES)
          .list(folderPath, {
            limit: 100,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (!listError && data) {
          // Map files to FileMetadata format
          const storageFiles: FileMetadata[] = data
            .filter(item => item.name && !item.name.startsWith('.'))
            .map((item) => ({
              name: item.name,
              path: `${folderPath}/${item.name}`,
              size: item.metadata?.size || 0,
              url: getPublicUrl(STORAGE_BUCKETS.LEARNING_RESOURCES, `${folderPath}/${item.name}`),
            }));

          // Add storage files that aren't already in the list (avoid duplicates)
          const existingUrls = new Set(fileList.map(f => f.url));
          storageFiles.forEach(file => {
            if (!existingUrls.has(file.url)) {
              fileList.push(file);
            }
          });
        }
      } catch (storageError) {
        console.error("Error fetching from Supabase Storage:", storageError);
      }

      setFiles(fileList);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [resourcesType, level, id]);

  if (loading) {
    return (
      <div className="mt-10 flex items-center justify-center ">
        <Spinner className="fill-green1 w-8 " />
      </div>
    );
  } else if (files.length === 0) {
    if (error) {
      return (
        <div className="flex items-center justfiy-center flex-col">
          <img
            src={book}
            alt="File not available"
            className=" w-full ss:w-[300px]"
          />
          <p className="text-sm ss:text-xs text-gray-700 font-[500] text-center ">
            Oops, something went wrong. Please try again.
          </p>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center flex-col">
          <img
            src={fileSearch}
            alt="File not available"
            className=" w-full ss:w-[400px]"
          />
          <p className="text-sm ss:text-base text-gray-500 font-[500] text-center ">
            Sorry, {id}{" "}
            {resourcesType === "textbooks"
              ? "Textbooks"
              : resourcesType === "pastquestions"
                ? "Past Questions"
                : "Handouts"}{" "}
            are not available.
          </p>
        </div>
      );
    }
  } else if (files.length > 0) {
    // If user is not logged in, show login prompt with blurred content preview
    if (!user) {
      return (
        <div className="relative">
          {/* Blurred content preview */}
          <div className="grid items-center xss:grid-cols-2 sm:grid-cols-3 gap-4 blur-sm pointer-events-none select-none">
            {files.slice(0, 6).map((info, i) => (
              <motion.div
                key={i}
                variants={fadeInVariants1}
                initial="initial"
                whileInView="animate"
                viewport={{
                  once: true,
                }}
                custom={i}
              >
                <ContentCard {...info} />
              </motion.div>
            ))}
          </div>
          
          {/* Login prompt overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-sm mx-4 text-center border border-gray-100"
            >
              <div className="w-16 h-16 bg-green1/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LockKeyhole className="w-8 h-8 text-green1" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Login Required
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Please login to access {resourcesType === "textbooks" ? "textbooks" : resourcesType === "pastquestions" ? "past questions" : "handouts"} and download study materials.
              </p>
              <div className="flex flex-col gap-3">
                <Link 
                  to={`/login?redirect=${encodeURIComponent(currentPath)}`}
                  className="w-full py-3 px-4 bg-green1 hover:bg-green2 text-white font-semibold rounded-lg transition-colors text-center"
                >
                  Login to Continue
                </Link>
                <Link 
                  to={`/signup?redirect=${encodeURIComponent(currentPath)}`}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors text-center"
                >
                  Create Account
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {files.length} {resourcesType === "textbooks" ? "textbook" : resourcesType === "pastquestions" ? "past question" : "handout"}{files.length !== 1 ? "s" : ""} available
              </p>
            </motion.div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid items-center xss:grid-cols-2 sm:grid-cols-3 gap-4">
        {files.map((info, i) => (
          <motion.div
            key={i}
            variants={fadeInVariants1}
            initial="initial"
            whileInView="animate"
            viewport={{
              once: true,
            }}
            custom={i}
          >
            <ContentCard {...info} />
          </motion.div>
        ))}
      </div>
    );
  }
}
