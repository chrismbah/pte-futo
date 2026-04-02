import { useCallback, useEffect, useState } from 'react';
import { supabase, CommunityGroup } from '../lib/supabase';

// ── Fetch all active communities ───────────────────────────────────────────
export const useCommunities = () => {
  const [communities, setCommunities] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('communities')
        .select('*')
        .eq('is_active', true)
        .order('member_count', { ascending: false });

      if (err) throw err;
      setCommunities(data || []);
    } catch (err) {
      console.error('[useCommunities] fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { communities, loading, error, refetch: fetch };
};

// ── Fetch a single community by slug ──────────────────────────────────────
export const useCommunityBySlug = (slug: string) => {
  const [community, setCommunity] = useState<CommunityGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
          .from('communities')
          .select('*')
          .eq('slug', slug)
          .single();

        if (err) throw err;
        setCommunity(data);
      } catch (err) {
        console.error('[useCommunityBySlug] fetch error:', err);
        setError(err instanceof Error ? err.message : 'Community not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { community, loading, error };
};

// ── Check + toggle membership ─────────────────────────────────────────────
export const useCommunityMembership = (communityId: string, userId: string) => {
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!communityId || !userId || userId === 'anonymous') {
      setLoading(false);
      return;
    }
    const check = async () => {
      const { data } = await supabase
        .from('community_memberships')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .maybeSingle();
      setIsMember(!!data);
      setLoading(false);
    };
    check();
  }, [communityId, userId]);

  const toggle = useCallback(async () => {
    if (!communityId || !userId || userId === 'anonymous') return;
    setToggling(true);
    try {
      if (isMember) {
        await supabase
          .from('community_memberships')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', userId);
        setIsMember(false);
      } else {
        await supabase
          .from('community_memberships')
          .insert([{ community_id: communityId, user_id: userId }]);
        setIsMember(true);
      }
    } catch (err) {
      console.error('[useCommunityMembership] toggle error:', err);
    } finally {
      setToggling(false);
    }
  }, [communityId, userId, isMember]);

  return { isMember, loading, toggling, toggle };
};

// ── Posts within a community ──────────────────────────────────────────────
export const useCommunityPosts = (communityId: string | null) => {
  const [posts, setPosts] = useState<import('../lib/supabase').Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
          .from('community_messages')
          .select('*')
          .eq('community_id', communityId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(50);

        if (err) throw err;
        setPosts(data || []);
      } catch (err) {
        console.error('[useCommunityPosts] fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetch();

    // Realtime: new posts in this community
    const channel = supabase
      .channel(`community_posts:${communityId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_messages', filter: `community_id=eq.${communityId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [payload.new as import('../lib/supabase').Community, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as import('../lib/supabase').Community;
            if (updated.is_deleted) {
              setPosts((prev) => prev.filter((p) => p.id !== updated.id));
            } else {
              setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            }
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [communityId]);

  return { posts, loading, error };
};

// ── Post a message into a community ──────────────────────────────────────
export const usePostToCommunity = () => {
  const [posting, setPosting] = useState(false);

  const post = useCallback(async (params: {
    communityId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    message: string;
    imageUrls?: string[];
  }) => {
    setPosting(true);
    try {
      const { error: err } = await supabase.from('community_messages').insert([{
        community_id: params.communityId,
        user_id: params.userId,
        user_name: params.userName,
        user_avatar: params.userAvatar,
        message: params.message,
        topic: 'General',
        ...(params.imageUrls && params.imageUrls.length > 0 ? { image_urls: params.imageUrls } : {}),
      }]);
      if (err) throw err;
    } finally {
      setPosting(false);
    }
  }, []);

  return { post, posting };
};
