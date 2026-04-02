import { useCallback, useEffect, useState } from 'react';
import {
  collection, query, orderBy, limit as firestoreLimit, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  increment, getDoc, where, getDocs, writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export type PremiumMessage = {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  image_url?: string;
  likes_count: number;
  replies_count: number;
  is_pinned: boolean;
  is_announcement: boolean;
  created_at: string;
};

export type PremiumReply = {
  id: string;
  message_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
};

const MESSAGES_COL = 'premium_community_messages';
const REPLIES_COL = 'premium_community_replies';
const LIKES_COL = 'premium_community_likes';

const docToMessage = (id: string, data: Record<string, unknown>): PremiumMessage => ({
  id,
  user_id: (data.user_id as string) || '',
  user_name: (data.user_name as string) || 'Unknown',
  user_avatar: (data.user_avatar as string) || undefined,
  content: (data.content as string) || '',
  image_url: (data.image_url as string) || undefined,
  likes_count: (data.likes_count as number) || 0,
  replies_count: (data.replies_count as number) || 0,
  is_pinned: (data.is_pinned as boolean) || false,
  is_announcement: (data.is_announcement as boolean) || false,
  created_at: data.created_at
    ? (data.created_at as { toDate?: () => Date }).toDate
      ? (data.created_at as { toDate: () => Date }).toDate().toISOString()
      : String(data.created_at)
    : new Date().toISOString(),
});

const docToReply = (id: string, data: Record<string, unknown>): PremiumReply => ({
  id,
  message_id: (data.message_id as string) || '',
  user_id: (data.user_id as string) || '',
  user_name: (data.user_name as string) || 'Unknown',
  user_avatar: (data.user_avatar as string) || undefined,
  content: (data.content as string) || '',
  created_at: data.created_at
    ? (data.created_at as { toDate?: () => Date }).toDate
      ? (data.created_at as { toDate: () => Date }).toDate().toISOString()
      : String(data.created_at)
    : new Date().toISOString(),
});

// ── Messages ──────────────────────────────────────────────
export const usePremiumMessages = (limitCount = 50) => {
  const [messages, setMessages] = useState<PremiumMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, MESSAGES_COL),
      orderBy('created_at', 'desc'),
      firestoreLimit(limitCount)
    );

    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => docToMessage(d.id, d.data() as Record<string, unknown>));
      // Pinned first, then by date
      all.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setMessages(all);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [limitCount]);

  return { messages, loading };
};

// ── Replies ───────────────────────────────────────────────
export const usePremiumReplies = (messageId: string) => {
  const [replies, setReplies] = useState<PremiumReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!messageId) return;

    const q = query(
      collection(db, REPLIES_COL),
      where('message_id', '==', messageId),
      orderBy('created_at', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setReplies(snap.docs.map((d) => docToReply(d.id, d.data() as Record<string, unknown>)));
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [messageId]);

  return { replies, loading };
};

// ── Post message ──────────────────────────────────────────
export const usePostPremiumMessage = () => {
  const [posting, setPosting] = useState(false);

  const post = useCallback(async (
    userId: string,
    userName: string,
    content: string,
    userAvatar?: string,
    isAnnouncement = false,
    imageUrl?: string,
  ) => {
    setPosting(true);
    try {
      await addDoc(collection(db, MESSAGES_COL), {
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar || null,
        content,
        image_url: imageUrl || null,
        is_announcement: isAnnouncement,
        is_pinned: false,
        likes_count: 0,
        replies_count: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    } finally {
      setPosting(false);
    }
  }, []);

  return { post, posting };
};

// ── Post reply ────────────────────────────────────────────
export const usePostPremiumReply = () => {
  const [posting, setPosting] = useState(false);

  const postReply = useCallback(async (
    messageId: string,
    userId: string,
    userName: string,
    content: string,
    userAvatar?: string,
  ) => {
    setPosting(true);
    try {
      await addDoc(collection(db, REPLIES_COL), {
        message_id: messageId,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar || null,
        content,
        created_at: serverTimestamp(),
      });
      // Increment replies_count on parent message
      await updateDoc(doc(db, MESSAGES_COL, messageId), {
        replies_count: increment(1),
      });
    } finally {
      setPosting(false);
    }
  }, []);

  return { postReply, posting };
};

// ── Like / Unlike ─────────────────────────────────────────
export const usePremiumLike = () => {
  const toggle = useCallback(async (messageId: string, userId: string, liked: boolean) => {
    const likeId = `${messageId}_${userId}`;
    const likeRef = doc(db, LIKES_COL, likeId);
    const msgRef = doc(db, MESSAGES_COL, messageId);

    if (liked) {
      await deleteDoc(likeRef);
      await updateDoc(msgRef, { likes_count: increment(-1) });
    } else {
      const batch = writeBatch(db);
      batch.set(likeRef, { message_id: messageId, user_id: userId, created_at: serverTimestamp() });
      batch.update(msgRef, { likes_count: increment(1) });
      await batch.commit();
    }
  }, []);

  const getUserLikes = useCallback(async (userId: string): Promise<string[]> => {
    const q = query(collection(db, LIKES_COL), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => (d.data() as { message_id: string }).message_id);
  }, []);

  return { toggle, getUserLikes };
};

// ── Admin: delete, pin, announce ──────────────────────────
export const useAdminPremiumActions = () => {
  const deleteMsg = useCallback(async (id: string) => {
    // Delete all replies and likes for this message too
    const repliesSnap = await getDocs(query(collection(db, REPLIES_COL), where('message_id', '==', id)));
    const batch = writeBatch(db);
    repliesSnap.forEach((d) => batch.delete(d.ref));
    batch.delete(doc(db, MESSAGES_COL, id));
    await batch.commit();
  }, []);

  const togglePin = useCallback(async (id: string, current: boolean) => {
    await updateDoc(doc(db, MESSAGES_COL, id), { is_pinned: !current });
  }, []);

  const toggleAnnouncement = useCallback(async (id: string, current: boolean) => {
    await updateDoc(doc(db, MESSAGES_COL, id), { is_announcement: !current });
  }, []);

  const deleteReply = useCallback(async (id: string, messageId: string) => {
    await deleteDoc(doc(db, REPLIES_COL, id));
    await updateDoc(doc(db, MESSAGES_COL, messageId), { replies_count: increment(-1) });
  }, []);

  return { deleteMsg, togglePin, toggleAnnouncement, deleteReply };
};
