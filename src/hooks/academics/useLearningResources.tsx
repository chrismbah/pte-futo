/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { supabase, STORAGE_BUCKETS, getPublicUrl } from "../../config/supabase";
import { FileMetadata } from "../../models/academics/learning-resources";
import { db, isFirebaseConfigured } from "../../config/firebase";
import { collection, getDocs, query, where, and } from "firebase/firestore";

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

export const useLearningResources = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [gettingResources, setGettingResources] = useState(false);
  const [error, setError] = useState(false);

  const getLearningResources = async (
    level: string,
    course: string,
    resourcesType: string
  ) => {
    const folderPath = `levels/${level}/${course}/${resourcesType}`;
    
    try {
      setError(false);
      setGettingResources(true);
      
      let fileList: FileMetadata[] = [];

      // 1. First fetch from Firestore (admin-uploaded materials with metadata)
      if (isFirebaseConfigured) {
        try {
          const q = query(
            collection(db, "learningMaterials"),
            and(
              where("level", "==", level),
              where("courseCode", "==", course),
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
      setGettingResources(false);
    } catch (error: any) {
      setError(error);
      setGettingResources(false);
      console.error("Error fetching files:", error);
    }
  };

  // Helper function to download a file
  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.LEARNING_RESOURCES)
        .download(filePath);

      if (error) {
        throw error;
      }

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  };

  return { getLearningResources, files, gettingResources, error, downloadFile };
};
