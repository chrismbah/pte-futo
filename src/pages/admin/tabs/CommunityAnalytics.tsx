import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { MessageCircle, Users, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsData {
  date: string;
  messageCount: number;
  userCount: number;
  topicsBreakdown: Record<string, number>;
}

interface TopicsStats {
  [key: string]: number;
}

const CommunityAnalytics: React.FC = () => {
  const [, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [topicsStats, setTopicsStats] = useState<TopicsStats>({});
  const [totalStats, setTotalStats] = useState({
    totalMessages: 0,
    totalUsers: 0,
    avgMessagesPerDay: 0,
    topTopic: '',
  });
  const [dateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all messages with timestamps
      const { data: messages, error: msgErr } = await supabase
        .from('community_messages')
        .select('created_at, topic');

      if (msgErr) throw msgErr;

      // Group messages by date and topic
      const groupedData: Record<string, { users: Set<string>; topics: TopicsStats }> = {};
      const globalTopics: TopicsStats = {};

      messages?.forEach((msg: any) => {
        const date = new Date(msg.created_at).toISOString().split('T')[0];
        
        if (!groupedData[date]) {
          groupedData[date] = { users: new Set(), topics: {} };
        }

        // Count topic
        globalTopics[msg.topic] = (globalTopics[msg.topic] || 0) + 1;
        groupedData[date].topics[msg.topic] = (groupedData[date].topics[msg.topic] || 0) + 1;
      });

      // Transform to analytics format
      const analytics: AnalyticsData[] = Object.entries(groupedData).map(([date, data]) => ({
        date,
        messageCount: Object.values(data.topics).reduce((a, b) => a + b, 0),
        userCount: data.users.size,
        topicsBreakdown: data.topics,
      }));

      setAnalyticsData(analytics.sort((a, b) => a.date.localeCompare(b.date)));
      setTopicsStats(globalTopics);

      // Calculate total stats
      const totalMessages = messages?.length || 0;
      const avgPerDay = analytics.length > 0 ? (totalMessages / analytics.length).toFixed(1) : '0';
      const topTopic = Object.entries(globalTopics).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

      setTotalStats({
        totalMessages,
        totalUsers: Object.keys(groupedData).length,
        avgMessagesPerDay: parseFloat(avgPerDay as string),
        topTopic,
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTopicColor = (topic: string): string => {
    const colors: Record<string, string> = {
      'General': 'bg-purple-100 text-purple-700',
      'Academics': 'bg-blue-100 text-blue-700',
      'Campus Life': 'bg-pink-100 text-pink-700',
      'Tech': 'bg-green-100 text-green-700',
      'Events': 'bg-amber-100 text-amber-700',
    };
    return colors[topic] || 'bg-gray-100 text-gray-700';
  };

  const maxMessages = Math.max(...analyticsData.map((d) => d.messageCount), 1);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalStats.totalMessages}</p>
            </div>
            <MessageCircle className="w-10 h-10 text-teal-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Days</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{analyticsData.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg/Day</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalStats.avgMessagesPerDay}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Top Topic</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{totalStats.topTopic}</p>
            </div>
            <Users className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Topics Distribution */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Messages by Topic</h3>
        <div className="space-y-3">
          {Object.entries(topicsStats)
            .sort(([, a], [, b]) => b - a)
            .map(([topic, count]) => {
              const percentage = (count / totalStats.totalMessages) * 100;
              return (
                <div key={topic}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTopicColor(topic)}`}>
                      {topic}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{count} messages</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Activity</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {analyticsData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data available</p>
          ) : (
            analyticsData.slice(-30).map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24">{new Date(day.date).toLocaleDateString()}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full transition-all flex items-center justify-center"
                      style={{ width: `${(day.messageCount / maxMessages) * 100}%` }}
                    >
                      {day.messageCount > 0 && (
                        <span className="text-xs font-semibold text-white">{day.messageCount}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">{day.messageCount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Trends */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Trends</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Peak Activity Day</p>
            <p className="text-2xl font-bold text-teal-600">
              {analyticsData.length > 0
                ? new Date(analyticsData.reduce((a, b) => (a.messageCount > b.messageCount ? a : b)).date).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Messages This Week</p>
            <p className="text-2xl font-bold text-blue-600">
              {analyticsData
                .filter(
                  (d) =>
                    new Date(d.date).getTime() >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
                )
                .reduce((sum, d) => sum + d.messageCount, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityAnalytics;
