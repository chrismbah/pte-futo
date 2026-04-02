/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { useGetUserInfo } from "../auth/useGetUserInfo";

export interface ActivityEntry {
  type: "page_visit" | "resource_view" | "quiz" | "session_start" | "outline_view";
  label: string;
  timestamp: number; // ms since epoch
}

export interface AnalyticsSummary {
  totalStudyMinutes: number;
  studyStreak: number;
  resourcesAccessed: number;
  pagesVisited: number;
  quizzesAttempted: number;
  averageQuizScore: number;
  bestQuizScore: number;
  recentActivity: ActivityEntry[];
  weeklyActivity: { day: string; minutes: number }[];
  pageBreakdown: { label: string; count: number }[];
  isLoading: boolean;
}

const STORAGE_KEY = "ebsu_analytics";
const STREAK_KEY = "ebsu_streak";

// ---- Local storage helpers ----
const getLocal = (): { activities: ActivityEntry[]; sessionStart: number } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { activities: [], sessionStart: Date.now() };
  } catch {
    return { activities: [], sessionStart: Date.now() };
  }
};

const saveLocal = (data: { activities: ActivityEntry[]; sessionStart: number }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {/* ignore */}
};

const getStreakData = (): { streak: number; lastVisitDate: string } => {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { streak: 0, lastVisitDate: "" };
  } catch {
    return { streak: 0, lastVisitDate: "" };
  }
};

const updateStreak = (): number => {
  const today = new Date().toISOString().slice(0, 10);
  const data = getStreakData();
  if (data.lastVisitDate === today) return data.streak;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = data.lastVisitDate === yesterday ? data.streak + 1 : 1;
  localStorage.setItem(STREAK_KEY, JSON.stringify({ streak: newStreak, lastVisitDate: today }));
  return newStreak;
};

// ---- Public tracker function — call this from any page ----
export const trackActivity = (type: ActivityEntry["type"], label: string) => {
  const data = getLocal();
  const entry: ActivityEntry = { type, label, timestamp: Date.now() };
  // Avoid duplicate consecutive entries
  const last = data.activities[data.activities.length - 1];
  if (last && last.type === type && last.label === label && Date.now() - last.timestamp < 5000) return;
  data.activities = [...data.activities.slice(-199), entry]; // keep last 200
  saveLocal(data);
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const useAnalytics = (): AnalyticsSummary => {
  const { userID } = useGetUserInfo();
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalStudyMinutes: 0,
    studyStreak: 0,
    resourcesAccessed: 0,
    pagesVisited: 0,
    quizzesAttempted: 0,
    averageQuizScore: 0,
    bestQuizScore: 0,
    recentActivity: [],
    weeklyActivity: [],
    pageBreakdown: [],
    isLoading: true,
  });

  useEffect(() => {
    // Track session start
    trackActivity("session_start", "Session started");
    const streak = updateStreak();

    const load = async () => {
      const local = getLocal();
      const activities = local.activities;

      // --- Study time: sum of session durations stored in activities ---
      const sessionStarts = activities.filter((a) => a.type === "session_start");
      const sessionDurations = sessionStarts.map((s, i) => {
        const nextSession = sessionStarts[i + 1];
        const end = nextSession ? nextSession.timestamp : Date.now();
        return Math.max(0, Math.min((end - s.timestamp) / 60000, 120)); // cap at 2h per session
      });
      const totalStudyMinutes = Math.round(sessionDurations.reduce((a, b) => a + b, 0));

      // --- Weekly activity ---
      const now = Date.now();
      const weeklyActivity = DAY_LABELS.map((day, idx) => {
        const dayStart = now - (6 - idx) * 86400000;
        const dayEnd = dayStart + 86400000;
        const dayActivities = activities.filter(
          (a) => a.timestamp >= dayStart && a.timestamp < dayEnd && a.type === "session_start"
        );
        const mins = dayActivities.reduce((acc, s, _i) => {
          const arr = activities.filter((a) => a.type === "session_start");
          const nextIdx = arr.findIndex((a) => a.timestamp === s.timestamp) + 1;
          const nextSession = arr[nextIdx];
          const end = nextSession ? nextSession.timestamp : Math.min(Date.now(), dayEnd);
          return acc + Math.max(0, Math.min((end - s.timestamp) / 60000, 120));
        }, 0);
        return { day, minutes: Math.round(mins) };
      });

      // --- Page breakdown ---
      const pageCounts: Record<string, number> = {};
      activities
        .filter((a) => a.type === "page_visit")
        .forEach((a) => {
          pageCounts[a.label] = (pageCounts[a.label] || 0) + 1;
        });
      const pageBreakdown = Object.entries(pageCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // --- Resources & pages ---
      const resourcesAccessed = activities.filter((a) => a.type === "resource_view").length;
      const pagesVisited = activities.filter((a) => a.type === "page_visit").length;

      // --- Quiz data from Supabase ---
      let quizzesAttempted = 0;
      let averageQuizScore = 0;
      let bestQuizScore = 0;
      try {
        if (userID) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: attempts } = await supabase
              .from("quiz_attempts")
              .select("score, percentage")
              .eq("user_id", user.id);
            if (attempts && attempts.length > 0) {
              const scores = attempts.map((d: any) => d.percentage || 0);
              quizzesAttempted = attempts.length;
              averageQuizScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / quizzesAttempted);
              bestQuizScore = Math.max(...scores);
            }
          }
        }
      } catch {/* supabase may not be auth'd */}

      // --- Also pull quiz activity from local ---
      const localQuizAttempts = activities.filter((a) => a.type === "quiz").length;
      if (quizzesAttempted === 0 && localQuizAttempts > 0) {
        quizzesAttempted = localQuizAttempts;
      }

      // --- Recent activity ---
      const recentActivity = [...activities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      setSummary({
        totalStudyMinutes,
        studyStreak: streak,
        resourcesAccessed,
        pagesVisited,
        quizzesAttempted,
        averageQuizScore,
        bestQuizScore,
        recentActivity,
        weeklyActivity,
        pageBreakdown,
        isLoading: false,
      });
    };

    load();

    // Refresh every 30s to pick up real-time updates
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [userID]);

  return summary;
};
