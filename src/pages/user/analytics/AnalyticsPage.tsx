import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, BookOpen, Target, Award, BarChart3, Clock, Zap, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAnalytics, trackActivity } from "../../../hooks/analytics/useAnalytics";

const fadeIn = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const ACTIVITY_LABELS: Record<string, { icon: string; color: string; bg: string }> = {
  session_start: { icon: "M5 13l4 4L19 7", color: "text-green-600", bg: "bg-green-100" },
  page_visit:    { icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", color: "text-blue-600", bg: "bg-blue-100" },
  resource_view: { icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", color: "text-amber-600", bg: "bg-amber-100" },
  quiz:          { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-purple-600", bg: "bg-purple-100" },
  outline_view:  { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-teal-600", bg: "bg-teal-100" },
};

const formatTime = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

const formatMinutes = (mins: number) => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const analytics = useAnalytics();

  // Track that this page was visited
  useEffect(() => {
    trackActivity("page_visit", "Learning Analytics");
  }, []);

  const maxWeeklyMins = Math.max(...analytics.weeklyActivity.map((d: { minutes: number }) => d.minutes), 1);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pb-20"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      {/* Header */}
      <motion.div
        className="sticky top-0 z-40 bg-white border-b-2 border-green1"
        variants={fadeIn}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 md:px-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-green1/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-green1" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-green1">Learning Analytics</h1>
            <p className="text-xs text-gray-500 mt-0.5">Your real-time study activity & progress</p>
          </div>
          {analytics.isLoading && (
            <div className="ml-auto w-4 h-4 border-2 border-green1 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 space-y-6">

        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          variants={stagger}
        >
          {/* Study Time */}
          <motion.div variants={fadeIn} transition={{ duration: 0.35 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium leading-snug">Study Time<br/>This Session</p>
              <div className="p-1.5 bg-green1/10 rounded-lg">
                <Clock className="w-4 h-4 text-green1" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green1">
              {analytics.isLoading ? "—" : formatMinutes(analytics.totalStudyMinutes)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">accumulated total</p>
          </motion.div>

          {/* Study Streak */}
          <motion.div variants={fadeIn} transition={{ duration: 0.35, delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium leading-snug">Daily<br/>Streak</p>
              <div className="p-1.5 bg-orange-50 rounded-lg">
                <Zap className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {analytics.isLoading ? "—" : `${analytics.studyStreak} days`}
            </h3>
            <p className="text-xs text-gray-400 mt-1">consecutive days</p>
          </motion.div>

          {/* Resources */}
          <motion.div variants={fadeIn} transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium leading-snug">Resources<br/>Opened</p>
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <BookOpen className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {analytics.isLoading ? "—" : analytics.resourcesAccessed}
            </h3>
            <p className="text-xs text-gray-400 mt-1">study materials</p>
          </motion.div>

          {/* Quizzes */}
          <motion.div variants={fadeIn} transition={{ duration: 0.35, delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium leading-snug">Quiz<br/>Attempts</p>
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {analytics.isLoading ? "—" : analytics.quizzesAttempted}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {analytics.averageQuizScore > 0 ? `avg ${analytics.averageQuizScore}%` : "no attempts yet"}
            </p>
          </motion.div>
        </motion.div>

        {/* Quiz performance + Pages visited row */}
        {(analytics.averageQuizScore > 0 || analytics.pagesVisited > 0) && (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={stagger}>
            {analytics.averageQuizScore > 0 && (
              <motion.div variants={fadeIn} transition={{ duration: 0.35 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-green1" />
                  <h2 className="font-bold text-gray-900">Quiz Performance</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Average Score</span>
                      <span className="font-semibold text-gray-800">{analytics.averageQuizScore}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analytics.averageQuizScore}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-green1 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Best Score</span>
                      <span className="font-semibold text-gray-800">{analytics.bestQuizScore}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analytics.bestQuizScore}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
                        className="h-full bg-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {analytics.pageBreakdown.length > 0 && (
              <motion.div variants={fadeIn} transition={{ duration: 0.35 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-green1" />
                  <h2 className="font-bold text-gray-900">Pages Visited Most</h2>
                </div>
                <div className="space-y-2">
                  {analytics.pageBreakdown.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 truncate max-w-[160px]">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / (analytics.pageBreakdown[0]?.count || 1)) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.05 }}
                            className="h-full bg-green1 rounded-full"
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700 min-w-[20px]">{item.count}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Weekly Activity Chart */}
        <motion.div variants={fadeIn} transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-green1" />
            <h2 className="font-bold text-gray-900">Weekly Study Activity</h2>
            <span className="ml-auto text-xs text-gray-400">last 7 days</span>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-32">
            {analytics.weeklyActivity.map((item: any, idx: number) => {
              const heightPct = maxWeeklyMins > 0 ? (item.minutes / maxWeeklyMins) * 100 : 0;
              const isToday = idx === analytics.weeklyActivity.length - 1;
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-xs text-gray-400">{item.minutes > 0 ? formatMinutes(item.minutes) : ""}</span>
                  <div className="w-full flex items-end" style={{ height: "88px" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPct, item.minutes > 0 ? 4 : 0)}%` }}
                      transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.07 }}
                      className={`w-full rounded-t-lg ${isToday ? "bg-green1" : "bg-green1/30"}`}
                      title={`${item.minutes} min`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isToday ? "text-green1 font-bold" : "text-gray-500"}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
          {analytics.weeklyActivity.every((d: any) => d.minutes === 0) && (
            <p className="text-center text-xs text-gray-400 mt-2">Start exploring the portal to see your activity here!</p>
          )}
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div variants={fadeIn} transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green1" />
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
          </div>

          {analytics.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No activity recorded yet.</p>
              <p className="text-xs text-gray-300 mt-1">Browse resources, take quizzes or view outlines to build your history.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.recentActivity.map((entry: any, idx: number) => {
                const style = ACTIVITY_LABELS[entry.type] ?? ACTIVITY_LABELS.page_visit;
                return (
                  <motion.div
                    key={idx}
                    variants={fadeIn}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                      <svg className={`w-4 h-4 ${style.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{entry.label}</p>
                      <p className="text-xs text-gray-400 capitalize">{entry.type.replace("_", " ")}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(entry.timestamp)}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}
