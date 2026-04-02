import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase, Community, CommunityReport } from '../../../lib/supabase';
import { MessageCircle, AlertTriangle, Trash2, Eye, Search, Edit2, Send, Check, Pin } from 'lucide-react';

interface ExtendedMessage extends Community {
  report_count?: number;
  reported?: boolean;
}

const CommunityMonitor: React.FC = () => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'reported'>('all');
  const [, setSelectedMessage] = useState<ExtendedMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [showGuidelinesTab, setShowGuidelinesTab] = useState(false);
  const [guidelines, setGuidelines] = useState<Array<{ id: string; content: string; created_at: string }>>([]);
  const [newGuideline, setNewGuideline] = useState('');
  const [postingGuideline, setPostingGuideline] = useState(false);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalReports: 0,
    activeUsers: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('[v0] Fetching community data...');

      // Fetch messages
      const { data: msgData, error: msgErr } = await supabase
        .from('community_messages')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[v0] Messages fetched:', { msgData, msgErr });

      if (msgErr) throw msgErr;

      // Fetch reports
      const { data: reportData, error: reportErr } = await supabase
        .from('community_reports')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[v0] Reports fetched:', { reportData, reportErr });

      if (reportErr) throw reportErr;

      // Try to fetch guidelines - if table doesn't exist, continue without error
      let guidelineData = [];
      const { data: gData, error: guidelineErr } = await supabase
        .from('community_guidelines')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[v0] Guidelines fetched:', { gData, guidelineErr });

      if (guidelineErr && !guidelineErr.message.includes('Could not find the table')) {
        throw guidelineErr;
      }
      
      if (gData) {
        guidelineData = gData;
      }

      const messagesArray = (msgData || []) as ExtendedMessage[];
      console.log('[v0] Setting messages:', messagesArray.length, 'items');
      
      setMessages(messagesArray);
      setReports(reportData || []);
      setGuidelines(guidelineData);

      // Calculate stats
      const uniqueUsers = new Set(messagesArray.map((msg: any) => msg.user_id));
      setStats({
        totalMessages: messagesArray.length,
        totalReports: reportData?.length || 0,
        activeUsers: uniqueUsers.size,
      });
    } catch (err: any) {
      console.error('[v0] Failed to fetch data:', err);
      const errorMsg = err?.message || 'Failed to load community data';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('admin:community')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_messages',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [payload.new as ExtendedMessage, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? (payload.new as ExtendedMessage) : msg))
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleAddGuideline = async () => {
    if (!newGuideline.trim()) return;

    setPostingGuideline(true);
    try {
      console.log('[v0] Adding guideline:', newGuideline);
      
      const { data, error } = await supabase.from('community_guidelines').insert([
        {
          content: newGuideline.trim(),
          created_at: new Date().toISOString(),
        },
      ]).select();

      console.log('[v0] Insert response:', { data, error });

      if (error) {
        console.error('[v0] Insert error details:', error);
        throw error;
      }

      setNewGuideline('');
      
      // Use the returned data if available, otherwise use a temporary ID
      if (data && data.length > 0) {
        setGuidelines((prev) => [data[0], ...prev]);
      } else {
        // Fallback: fetch the guidelines again to ensure consistency
        const { data: guidelineData } = await supabase
          .from('community_guidelines')
          .select('*')
          .order('created_at', { ascending: false });
        setGuidelines(guidelineData || []);
      }
      
      toast.success('Guideline added!');
    } catch (err: any) {
      console.error('[v0] Failed to add guideline:', err);
      toast.error(err?.message || 'Failed to add guideline');
    } finally {
      setPostingGuideline(false);
    }
  };

  const handleDeleteGuideline = async (guidelineId: string) => {
    if (!window.confirm('Delete this guideline?')) return;

    try {
      const { error } = await supabase
        .from('community_guidelines')
        .delete()
        .eq('id', guidelineId);

      if (error) throw error;

      setGuidelines((prev) => prev.filter((g) => g.id !== guidelineId));
      toast.success('Guideline deleted!');
    } catch (err) {
      console.error('Failed to delete guideline:', err);
      toast.error('Failed to delete guideline');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) throw error;
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('community_reports')
        .update({ status: 'resolved' })
        .eq('id', reportId);

      if (error) throw error;
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r)));
    } catch (err) {
      console.error('Failed to resolve report:', err);
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!newText.trim()) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ message: newText, is_edited: true, updated_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, message: newText, is_edited: true } : msg
        )
      );
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to edit message:', err);
      alert('Failed to edit message');
    }
  };

  const handlePinMessage = async (messageId: string, currentPinnedState: boolean) => {
    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_pinned: !currentPinnedState })
        .eq('id', messageId);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_pinned: !currentPinnedState } : msg
        )
      );

      toast.success(!currentPinnedState ? 'Message pinned!' : 'Message unpinned!', {
        duration: 2000,
        position: 'top-right',
      });
    } catch (err) {
      console.error('Failed to pin message:', err);
      toast.error('Failed to update pin status');
    }
  };

  const handlePostAdminMessage = async () => {
    if (!newMessage.trim()) return;

    setPosting(true);
    try {
      const { error } = await supabase.from('community_messages').insert([
        {
          user_id: 'admin',
          user_name: 'Admin',
          user_avatar: null,
          message: newMessage,
          topic: 'General',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_edited: false,
          is_deleted: false,
          is_pinned: false,
        },
      ]);

      if (error) throw error;

      setNewMessage('');
      toast.success('Admin message posted!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
          color: 'white',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        icon: <Check className="w-5 h-5" />,
      });
    } catch (err) {
      console.error('Failed to post admin message:', err);
      toast.error('Failed to post message');
    } finally {
      setPosting(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.user_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'reported') {
      return matchesSearch && reports.some((r) => r.message_id === msg.id && r.status === 'pending');
    }

    return matchesSearch;
  });

  const topicColors: Record<string, string> = {
    'General': 'bg-purple-100 text-purple-700',
    'Academics': 'bg-blue-100 text-blue-700',
    'Campus Life': 'bg-pink-100 text-pink-700',
    'Tech': 'bg-green-100 text-green-700',
    'Events': 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      {/* Tab Buttons */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setShowGuidelinesTab(false)}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            !showGuidelinesTab
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Messages & Reports
        </button>
        <button
          onClick={() => setShowGuidelinesTab(true)}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            showGuidelinesTab
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Community Guidelines
        </button>
      </div>

      {!showGuidelinesTab ? (
        <>
          {/* Admin Message Composer */}
          <div className="bg-white rounded-xl p-6 border-2 border-teal-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Admin Message</h3>
            <div className="space-y-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write an admin announcement or message..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Posting as: <span className="font-semibold text-teal-600">Admin</span></p>
                <button
                  onClick={handlePostAdminMessage}
                  disabled={posting || !newMessage.trim()}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                  Post Message
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
        </>
      ) : (
        <>
          {/* Guidelines Management */}
          <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Community Guidelines</h3>
            <div className="space-y-3">
              <textarea
                value={newGuideline}
                onChange={(e) => setNewGuideline(e.target.value)}
                placeholder="Add a new community guideline..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={2}
              />
              <button
                onClick={handleAddGuideline}
                disabled={postingGuideline || !newGuideline.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Check className="w-4 h-4" />
                Add Guideline
              </button>
            </div>
          </div>

          {/* Current Guidelines */}
          {guidelines.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Guidelines</h3>
              <div className="space-y-3">
                {guidelines.map((guideline, index) => (
                  <div key={guideline.id} className="flex items-start justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm mb-1">#{index + 1}</p>
                      <p className="text-gray-700 text-sm">{guideline.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteGuideline(guideline.id)}
                      className="ml-3 text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMessages}</p>
            </div>
            <MessageCircle className="w-10 h-10 text-teal-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Reported</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalReports}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.activeUsers}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'reported')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Messages</option>
          <option value="reported">Reported Only</option>
        </select>
        <button
          onClick={() => fetchData()}
          disabled={loading}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const messageReports = reports.filter((r) => r.message_id === msg.id);
            const hasUnresolvedReports = messageReports.some((r) => r.status === 'pending');

            return (
              <div
                key={msg.id}
                className={`bg-white rounded-xl border-2 p-4 ${
                  hasUnresolvedReports ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex gap-3">
                  {msg.user_avatar ? (
                    <img src={msg.user_avatar} alt={msg.user_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                      {msg.user_name.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{msg.user_name}</p>
                        <p className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {msg.topic && msg.topic !== 'General' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${topicColors[msg.topic] || 'bg-gray-100'}`}>
                            {msg.topic}
                          </span>
                        )}
                        {hasUnresolvedReports && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {messageReports.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {editingId === msg.id ? (
                      <div className="mt-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 border border-teal-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleEditMessage(msg.id, editText)}
                            className="px-3 py-1 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditText('');
                            }}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 mt-2">{msg.message}</p>
                    )}

                    {hasUnresolvedReports && (
                      <div className="mt-3 bg-orange-100 rounded-lg p-3 text-sm">
                        <p className="font-semibold text-orange-900 mb-2">Reports:</p>
                        {messageReports
                          .filter((r) => r.status === 'pending')
                          .map((report) => (
                            <div key={report.id} className="flex justify-between items-start mb-2 last:mb-0">
                              <div>
                                <p className="text-orange-800">{report.reason || 'No reason provided'}</p>
                                <p className="text-xs text-orange-700">Reported by: {report.reported_by}</p>
                              </div>
                              <button
                                onClick={() => handleResolveReport(report.id)}
                                className="text-xs bg-orange-200 text-orange-900 px-2 py-1 rounded hover:bg-orange-300 transition-colors whitespace-nowrap ml-2"
                              >
                                Resolve
                              </button>
                            </div>
                          ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 flex-wrap">
                      <button
                        onClick={() => {
                          setEditingId(msg.id);
                          setEditText(msg.message);
                        }}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handlePinMessage(msg.id, msg.is_pinned || false)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          msg.is_pinned
                            ? 'text-amber-600 hover:text-amber-700'
                            : 'text-gray-600 hover:text-amber-600'
                        }`}
                      >
                        <Pin className="w-4 h-4" />
                        {msg.is_pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 transition-colors ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommunityMonitor;
