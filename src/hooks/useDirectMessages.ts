import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ── Types ──────────────────────────────────────────────────────────────────

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
  is_seen: boolean;
  is_delivered: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message?: string;
  last_message_at: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  is_online: boolean;
  last_seen: string;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

// ── User Profile ─────────────────────────────────────────────────────────────

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const q = query(collection(db, 'user_profiles'), where('user_id', '==', userId));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = d.data();
        setProfile({
          id: d.id,
          user_id: data.user_id as string,
          display_name: (data.display_name as string) || '',
          avatar_url: data.avatar_url as string | undefined,
          bio: data.bio as string | undefined,
          is_online: (data.is_online as boolean) || false,
          last_seen: toIso(data.last_seen),
          is_verified: (data.is_verified as boolean) || false,
          created_at: toIso(data.created_at),
          updated_at: toIso(data.updated_at),
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  return { profile, loading };
};

export const useUpsertUserProfile = () => {
  const upsert = useCallback(
    async (userId: string, displayName: string, avatarUrl?: string, bio?: string) => {
      try {
        const q = query(collection(db, 'user_profiles'), where('user_id', '==', userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(snap.docs[0].ref, {
            display_name: displayName,
            avatar_url: avatarUrl || null,
            bio: bio || '',
            updated_at: serverTimestamp(),
          });
        } else {
          await addDoc(collection(db, 'user_profiles'), {
            user_id: userId,
            display_name: displayName,
            avatar_url: avatarUrl || null,
            bio: bio || '',
            is_online: true,
            last_seen: serverTimestamp(),
            is_verified: false,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error('[dm] upsertUserProfile:', err);
      }
    },
    []
  );
  return { upsert };
};

// ── Conversations ─────────────────────────────────────────────────────────────

export const useConversations = (userId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const allConvs: Map<string, Conversation> = new Map();

    const mapDoc = (d: { id: string; data: () => Record<string, unknown> }): Conversation => ({
      id: d.id,
      participant_a: d.data().participant_a as string,
      participant_b: d.data().participant_b as string,
      last_message: d.data().last_message as string | undefined,
      last_message_at: toIso(d.data().last_message_at),
      created_at: toIso(d.data().created_at),
    });

    const sortAndSet = () => {
      const sorted = Array.from(allConvs.values()).sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
      setConversations(sorted);
      setLoading(false);
    };

    const qa = query(collection(db, 'conversations'), where('participant_a', '==', userId));
    const qb = query(collection(db, 'conversations'), where('participant_b', '==', userId));

    const unsub1 = onSnapshot(qa, (snap) => {
      snap.docs.forEach((d) => allConvs.set(d.id, mapDoc({ id: d.id, data: () => d.data() as Record<string, unknown> })));
      sortAndSet();
    });
    const unsub2 = onSnapshot(qb, (snap) => {
      snap.docs.forEach((d) => allConvs.set(d.id, mapDoc({ id: d.id, data: () => d.data() as Record<string, unknown> })));
      sortAndSet();
    });

    return () => { unsub1(); unsub2(); };
  }, [userId]);

  return { conversations, loading };
};

export const useGetOrCreateConversation = () => {
  const getOrCreate = useCallback(async (userA: string, userB: string): Promise<string | null> => {
    try {
      const qa = query(
        collection(db, 'conversations'),
        where('participant_a', '==', userA),
        where('participant_b', '==', userB)
      );
      const qb = query(
        collection(db, 'conversations'),
        where('participant_a', '==', userB),
        where('participant_b', '==', userA)
      );
      const [snapA, snapB] = await Promise.all([getDocs(qa), getDocs(qb)]);
      if (!snapA.empty) return snapA.docs[0].id;
      if (!snapB.empty) return snapB.docs[0].id;

      const docRef = await addDoc(collection(db, 'conversations'), {
        participant_a: userA,
        participant_b: userB,
        last_message: null,
        last_message_at: serverTimestamp(),
        created_at: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error('[dm] getOrCreateConversation:', err);
      return null;
    }
  }, []);
  return { getOrCreate };
};

// ── Direct Messages ───────────────────────────────────────────────────────────

export const useDirectMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }
    setLoading(true);

    const q = query(
      collection(db, 'direct_messages'),
      where('conversation_id', '==', conversationId),
      orderBy('created_at', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            conversation_id: data.conversation_id as string,
            sender_id: data.sender_id as string,
            receiver_id: data.receiver_id as string,
            content: (data.content as string) || '',
            image_url: data.image_url as string | undefined,
            is_seen: (data.is_seen as boolean) || false,
            is_delivered: (data.is_delivered as boolean) || false,
            created_at: toIso(data.created_at),
          };
        })
      );
      setLoading(false);
    });

    return () => unsub();
  }, [conversationId]);

  return { messages, loading };
};

export const useSendDirectMessage = () => {
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(
    async (
      conversationId: string,
      senderId: string,
      receiverId: string,
      content: string,
      imageUrl?: string
    ): Promise<DirectMessage | null> => {
      if (!content.trim() && !imageUrl) return null;
      setSending(true);
      try {
        const docRef = await addDoc(collection(db, 'direct_messages'), {
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content: content.trim() || '',
          image_url: imageUrl || null,
          is_seen: false,
          is_delivered: true,
          created_at: serverTimestamp(),
        });

        // Update conversation last_message
        await updateDoc(doc(db, 'conversations', conversationId), {
          last_message: content.trim() || '',
          last_message_at: serverTimestamp(),
        });

        const snap = await getDoc(docRef);
        const data = snap.data()!;
        return {
          id: snap.id,
          conversation_id: data.conversation_id as string,
          sender_id: data.sender_id as string,
          receiver_id: data.receiver_id as string,
          content: (data.content as string) || '',
          image_url: data.image_url as string | undefined,
          is_seen: false,
          is_delivered: true,
          created_at: toIso(data.created_at),
        };
      } catch (err) {
        console.error('[dm] sendMessage:', err);
        return null;
      } finally {
        setSending(false);
      }
    },
    []
  );

  return { sendMessage, sending };
};

export const useMarkMessagesAsSeen = () => {
  const markSeen = useCallback(async (conversationId: string, receiverId: string) => {
    const q = query(
      collection(db, 'direct_messages'),
      where('conversation_id', '==', conversationId),
      where('receiver_id', '==', receiverId),
      where('is_seen', '==', false)
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await updateDoc(d.ref, { is_seen: true, is_delivered: true });
    }
  }, []);
  return { markSeen };
};

// ── Online presence ───────────────────────────────────────────────────────────

export const useOnlinePresence = (userId?: string) => {
  useEffect(() => {
    if (!userId) return;

    const updateStatus = async (isOnline: boolean) => {
      const q = query(collection(db, 'user_profiles'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, {
          is_online: isOnline,
          last_seen: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
      }
    };

    updateStatus(true);
    const handleFocus = () => updateStatus(true);
    const handleBlur = () => updateStatus(false);
    const handleUnload = () => updateStatus(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      updateStatus(false);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [userId]);
};

// ── Typing indicator ──────────────────────────────────────────────────────────

export const useTypingIndicator = (conversationId: string, myId: string) => {
  const [otherTyping, setOtherTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId || !myId) return;
    const typingDocRef = doc(db, 'typing_indicators', conversationId);
    const unsub = onSnapshot(typingDocRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const typingUsers = (data.users as Record<string, number>) || {};
      const now = Date.now();
      const isOtherTyping = Object.entries(typingUsers).some(
        ([uid, ts]) => uid !== myId && now - ts < 4000
      );
      setOtherTyping(isOtherTyping);
      if (isOtherTyping) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setOtherTyping(false), 4000);
      }
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [conversationId, myId]);

  const sendTyping = useCallback(async () => {
    try {
      const typingDocRef = doc(db, 'typing_indicators', conversationId);
      const snap = await getDoc(typingDocRef);
      if (snap.exists()) {
        await updateDoc(typingDocRef, { [`users.${myId}`]: Date.now() });
      } else {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(typingDocRef, { users: { [myId]: Date.now() } });
      }
    } catch {
      // non-critical
    }
  }, [conversationId, myId]);

  return { otherTyping, sendTyping };
};

// ── All user profiles ─────────────────────────────────────────────────────────

export const useAllUserProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'user_profiles'), orderBy('display_name')));
    setProfiles(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          user_id: data.user_id as string,
          display_name: (data.display_name as string) || '',
          avatar_url: data.avatar_url as string | undefined,
          bio: data.bio as string | undefined,
          is_online: (data.is_online as boolean) || false,
          last_seen: toIso(data.last_seen),
          is_verified: (data.is_verified as boolean) || false,
          created_at: toIso(data.created_at),
          updated_at: toIso(data.updated_at),
        };
      })
    );
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { profiles, loading, refetch };
};

export const useToggleVerification = () => {
  const toggle = useCallback(async (userId: string, current: boolean) => {
    const q = query(collection(db, 'user_profiles'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(snap.docs[0].ref, { is_verified: !current, updated_at: serverTimestamp() });
    }
    return !snap.empty;
  }, []);
  return { toggle };
};
