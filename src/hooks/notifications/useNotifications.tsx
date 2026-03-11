/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  where,
  limit,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../config/firebase";
import { useGetUserInfo } from "../auth/useGetUserInfo";
import { INotification } from "../../models/notifications";

// Sample notifications for when Firebase is not configured or empty
const sampleNotifications: INotification[] = [
  {
    id: "notif1",
    title: "Welcome to EBSU Medicine Portal!",
    message: "Your account has been created successfully. Explore the dashboard to access learning resources, course outlines, and more.",
    type: "success",
    createdAt: new Date().toISOString(),
    read: false,
    link: "/dashboard",
  },
  {
    id: "notif2",
    title: "New Blog Post Available",
    message: "Check out our latest article on AI in Healthcare and how it's transforming medical education in Nigeria.",
    type: "info",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: false,
    link: "/blog",
  },
  {
    id: "notif3",
    title: "Exam Timetable Released",
    message: "The examination timetable for the current semester has been published. Please check the academics section for details.",
    type: "announcement",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    read: true,
    link: "/academics",
  },
  {
    id: "notif4",
    title: "Profile Update Reminder",
    message: "Complete your profile by adding your matric number and current level for a personalized experience.",
    type: "warning",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    read: true,
    link: "/u/profile",
  },
  {
    id: "notif5",
    title: "New Learning Resources Added",
    message: "Fresh study materials for 400 Level and 500 Level courses have been uploaded. Check them out!",
    type: "update",
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    read: true,
    link: "/learning-resources",
  },
];

export const useNotifications = () => {
  const { userID, user } = useGetUserInfo();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications
  useEffect(() => {
    if (!user || !userID) {
      setNotifications(sampleNotifications);
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      setNotifications(sampleNotifications);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query user-specific notifications and global announcements
    const userNotificationsRef = collection(db, "notifications");
    const notificationsQuery = query(
      userNotificationsRef,
      where("userId", "in", [userID, "global"]),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsList: INotification[] = [];
        snapshot.forEach((doc) => {
          notificationsList.push({
            id: doc.id,
            ...doc.data(),
          } as INotification);
        });

        // If no notifications from Firebase, use sample notifications
        if (notificationsList.length === 0) {
          setNotifications(sampleNotifications);
        } else {
          setNotifications(notificationsList);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching notifications:", err);
        setError(err);
        setNotifications(sampleNotifications);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, userID]);

  // Mark a single notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Update local state immediately for responsiveness
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      // Update in Firebase if configured
      if (isFirebaseConfigured && userID) {
        try {
          const notificationRef = doc(db, "notifications", notificationId);
          await updateDoc(notificationRef, { read: true });
        } catch (err) {
          console.error("Error marking notification as read:", err);
        }
      }
    },
    [userID]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Update local state immediately
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Update in Firebase if configured
    if (isFirebaseConfigured && userID) {
      try {
        const updatePromises = notifications
          .filter((n) => !n.read)
          .map((n) => {
            const notificationRef = doc(db, "notifications", n.id);
            return updateDoc(notificationRef, { read: true });
          });
        await Promise.all(updatePromises);
      } catch (err) {
        console.error("Error marking all notifications as read:", err);
      }
    }
  }, [notifications, userID]);

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    formatRelativeTime,
  };
};
