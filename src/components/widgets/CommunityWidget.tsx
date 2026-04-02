import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MessageCircle, Heart, MessageSquareMore } from 'lucide-react';

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

const CommunityWidget: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    let q;
    if (selectedTopic !== 'All') {
      q = query(
        collection(db, 'community_messages'),
        where('is_deleted', '==', false),
        where('topic', '==', selectedTopic),
        orderBy('created_at', 'desc'),
        limit(5)
      );
    } else {
      q = query(
        collection(db, 'community_messages'),
        where('is_deleted', '==', false),
        orderBy('created_at', 'desc'),
        limit(5)
      );
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => {
            const data = d.data();
            return { ...data, id: d.id, created_at: toIso(data.created_at) };
          })
        );
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [selectedTopic]);

  const topics = ['All', 'General', 'Academics', 'Campus Life', 'Tech', 'Events'];
  
  const topicColors: Record<string, string> = {
    'General': 'bg-purple-100 text-purple-700',
    'Academics': 'bg-blue-100 text-blue-700',
    'Campus Life': 'bg-pink-100 text-pink-700',
    'Tech': 'bg-green-100 text-green-700',
    'Events': 'bg-amber-100 text-amber-700',
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 shadow-lg border border-teal-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-2.5 rounded-lg">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Student Community</h3>
            <p className="text-sm text-gray-600">Campus discussions</p>
          </div>
        </div>
      </div>

      {/* Topic Filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedTopic === topic
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-teal-300'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No messages yet. Be the first to ask!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white rounded-xl p-3 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all"
            >
              <div className="flex gap-3">
                {msg.user_avatar ? (
                  <img
                    src={msg.user_avatar}
                    alt={msg.user_name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                    {msg.user_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{msg.user_name}</p>
                      <p className="text-xs text-gray-500">{getTimeAgo(msg.created_at)}</p>
                    </div>
                    {msg.topic !== 'General' && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${topicColors[msg.topic] || 'bg-gray-100 text-gray-700'}`}>
                        {msg.topic}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{msg.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <button className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                      <Heart className="w-3.5 h-3.5" />
                      {msg.likes_count}
                    </button>
                    <button className="flex items-center gap-1 hover:text-teal-500 transition-colors">
                      <MessageSquareMore className="w-3.5 h-3.5" />
                      {msg.reply_count}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All Button */}
      <button 
        onClick={() => navigate('/u/community')}
        className="w-full mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-2 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md"
      >
        Browse Communities
      </button>
    </div>
  );
};

export default CommunityWidget;
