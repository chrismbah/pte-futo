import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../hooks/notifications/useNotifications";
import { BellIcon } from "../icons/nav/BellIcon";
import { INotification } from "../../models/notifications";
import { Spinner } from "../loaders/Spinner";

const getNotificationIcon = (type: INotification["type"]) => {
  switch (type) {
    case "success":
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case "warning":
      return (
        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      );
    case "announcement":
      return (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
      );
    case "update":
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
};

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    formatRelativeTime,
  } = useNotifications();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green1 focus:ring-offset-2"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6 fill-green1" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[9999]"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-green1 hover:text-green5 font-medium transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="w-6 h-6" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <BellIcon className="w-8 h-8 fill-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm text-center">No notifications yet</p>
                  <p className="text-gray-400 text-xs text-center mt-1">
                    We'll notify you when something important happens
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? "bg-green-50/50" : ""
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${
                              !notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-green1 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
