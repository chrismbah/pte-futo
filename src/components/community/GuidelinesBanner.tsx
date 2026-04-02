import React, { useState, useEffect } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Guideline {
  id: string;
  content: string;
  created_at: string;
}

const GuidelinesBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuidelines();
    const channel = supabase
      .channel('community_guidelines_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_guidelines' }, fetchGuidelines)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const fetchGuidelines = async () => {
    try {
      const { data, error } = await supabase
        .from('community_guidelines')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setGuidelines(data || []);
    } catch (err) {
      console.error('[community] Failed to fetch guidelines:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || guidelines.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-800 text-sm">Community Guidelines</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {expanded ? 'Tap to collapse' : `${guidelines.length} rules · tap to view`}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100">
          <ol className="space-y-2.5 mt-3">
            {guidelines.map((g, i) => (
              <li key={g.id} className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{g.content}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default GuidelinesBanner;
