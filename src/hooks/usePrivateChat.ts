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
  or,
  and,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ── Types ──────────────────────────────────────────────────────────────────

export interface UserVerification {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
  bio?: string;
  online_status: 'online' | 'offline' | 'away';
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface PrivateChat {
  id: string;
  participant_1: string;
  participant_2: string;
  participant_1_name: string;
  participant_2_name: string;
  participant_1_avatar?: string;
  participant_2_avatar?: string;
  last_message?: string;
  last_message_at: string;
  created_at: string;
}

export interface PrivateMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  image_url?: string;
  is_seen: boolean;
  is_delivered: boolean;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function toIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

// ─────────────────────────────────────────────────────────
// USER VERIFICATION
// ─────────────────────────────────────────────────────────

export const useUserVerification = (userId: string) => {
  const [verification, setVerification] = useState<UserVerification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const q = query(
      collection(db, 'user_verification'),
      where('user_id', '==', userId)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = d.data();
        setVerification({
          id: d.id,
          user_id: data.user_id as string,
          user_name: (data.user_name as string) || '',
          user_avatar: data.user_avatar as string | undefined,
          is_verified: (data.is_verified as boolean) || false,
          verified_at: data.verified_at as string | undefined,
          verified_by: data.verified_by as string | undefined,
          bio: data.bio as string | undefined,
          online_status: (data.online_status as 'online' | 'offline' | 'away') || 'offline',
          last_seen: toIso(data.last_seen),
          created_at: toIso(data.created_at),
          updated_at: toIso(data.updated_at),
        });
      } else {
        setVerification(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const upsertVerification = useCallback(async (
    uid: string,
    name: string,
    avatar?: string,
    bio?: string,
  ) => {
    const q = query(collection(db, 'user_verification'), where('user_id', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(snap.docs[0].ref, {
        user_name: name,
        user_avatar: avatar || null,
        bio: bio || '',
        updated_at: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, 'user_verification'), {
        user_id: uid,
        user_name: name,
        user_avatar: avatar || null,
        bio: bio || '',
        is_verified: false,
        online_status: 'online',
        last_seen: serverTimestamp(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }
  }, []);

  const toggleVerified = useCallback(async (uid: string, current: boolean) => {
    const q = query(collection(db, 'user_verification'), where('user_id', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(snap.docs[0].ref, {
        is_verified: !current,
        verified_at: !current ? new Date().toISOString() : null,
        updated_at: serverTimestamp(),
      });
    }
  }, []);

  const setOnlineStatus = useCallback(async (uid: string, status: 'online' | 'offline') => {
    const q = query(collection(db, 'user_verification'), where('user_id', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(snap.docs[0].ref, {
        online_status: status,
        last_seen: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }
  }, []);

  return { verification, loading, upsertVerification, toggleVerified, setOnlineStatus };
};

export const useAnyUserVerification = (userId: string | null) => {
  const [verification, setVerification] = useState<UserVerification | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const q = query(
      collection(db, 'user_verification'),
      where('user_id', '==', userId)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = d.data();
        setVerification({
          id: d.id,
          user_id: data.user_id as string,
          user_name: (data.user_name as string) || '',
          user_avatar: data.user_avatar as string | undefined,
          is_verified: (data.is_verified as boolean) || false,
          verified_at: data.verified_at as string | undefined,
          verified_by: data.verified_by as string | undefined,
          bio: data.bio as string | undefined,
          online_status: (data.online_status as 'online' | 'offline' | 'away') || 'offline',
          last_seen: toIso(data.last_seen),
          created_at: toIso(data.created_at),
          updated_at: toIso(data.updated_at),
        });
      } else {
        setVerification(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  return { verification, loading };
};

// ─────────────────────────────────────────────────────────
// PRIVATE CHATS LIST
// ─────────────────────────────────────────────────────────

export const useMyChats = (userId: string) => {
  const [chats, setChats] = useState<PrivateChat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    // Query chats where user is participant_1 or participant_2
    const q1 = query(
      collection(db, 'private_chats'),
      where('participant_1', '==', userId),
      orderBy('last_message_at', 'desc')
    );
    const q2 = query(
      collection(db, 'private_chats'),
      where('participant_2', '==', userId),
      orderBy('last_message_at', 'desc')
    );

    const allChats: Map<string, PrivateChat> = new Map();

    const mapDoc = (d: { id: string; data: () => Record<string, unknown> }): PrivateChat => ({
      id: d.id,
      participant_1: d.data().participant_1 as string,
      participant_2: d.data().participant_2 as string,
      participant_1_name: (d.data().participant_1_name as string) || '',
      participant_2_name: (d.data().participant_2_name as string) || '',
      participant_1_avatar: d.data().participant_1_avatar as string | undefined,
      participant_2_avatar: d.data().participant_2_avatar as string | undefined,
      last_message: d.data().last_message as string | undefined,
      last_message_at: toIso(d.data().last_message_at),
      created_at: toIso(d.data().created_at),
    });

    const sortAndSet = () => {
      const sorted = Array.from(allChats.values()).sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
      setChats(sorted);
      setLoading(false);
    };

    const unsub1 = onSnapshot(q1, (snap) => {
      snap.docs.forEach((d) => allChats.set(d.id, mapDoc({ id: d.id, data: () => d.data() as Record<string, unknown> })));
      sortAndSet();
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      snap.docs.forEach((d) => allChats.set(d.id, mapDoc({ id: d.id, data: () => d.data() as Record<string, unknown> })));
      sortAndSet();
    });

    return () => { unsub1(); unsub2(); };
  }, [userId]);

  return { chats, loading };
};

// ─────────────────────────────────────────────────────────
// GET OR CREATE CHAT
// ─────────────────────────────────────────────────────────

export const useGetOrCreateChat = () => {
  const [loading, setLoading] = useState(false);

  const getOrCreate = useCallback(async (
    myId: string,
    myName: string,
    myAvatar: string | undefined,
    otherId: string,
    otherName: string,
    otherAvatar: string | undefined,
  ): Promise<string> => {
    setLoading(true);
    try {
      // Check both orderings
      const q1 = query(
        collection(db, 'private_chats'),
        where('participant_1', '==', myId),
        where('participant_2', '==', otherId)
      );
      const q2 = query(
        collection(db, 'private_chats'),
        where('participant_1', '==', otherId),
        where('participant_2', '==', myId)
      );

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      if (!snap1.empty) return snap1.docs[0].id;
      if (!snap2.empty) return snap2.docs[0].id;

      const docRef = await addDoc(collection(db, 'private_chats'), {
        participant_1: myId,
        participant_2: otherId,
        participant_1_name: myName,
        participant_2_name: otherName,
        participant_1_avatar: myAvatar || null,
        participant_2_avatar: otherAvatar || null,
        last_message: null,
        last_message_at: serverTimestamp(),
        created_at: serverTimestamp(),
      });
      return docRef.id;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getOrCreate, loading };
};

// ─────────────────────────────────────────────────────────
// PRIVATE MESSAGES IN A CHAT
// ─────────────────────────────────────────────────────────

export const usePrivateMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) { setLoading(false); return; }

    const q = query(
      collection(db, 'private_messages'),
      where('chat_id', '==', chatId),
      orderBy('created_at', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            chat_id: data.chat_id as string,
            sender_id: data.sender_id as string,
            sender_name: (data.sender_name as string) || '',
            sender_avatar: data.sender_avatar as string | undefined,
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
  }, [chatId]);

  return { messages, loading };
};

// ─────────────────────────────────────────────────────────
// SEND A MESSAGE
// ─────────────────────────────────────────────────────────

export const useSendPrivateMessage = () => {
  const [sending, setSending] = useState(false);

  const send = useCallback(async (
    chatId: string,
    senderId: string,
    senderName: string,
    content: string,
    senderAvatar?: string,
    imageUrl?: string,
  ) => {
    setSending(true);
    try {
      await addDoc(collection(db, 'private_messages'), {
        chat_id: chatId,
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar || null,
        content,
        image_url: imageUrl || null,
        is_seen: false,
        is_delivered: true,
        created_at: serverTimestamp(),
      });

      // Update last_message on the chat document
      await updateDoc(doc(db, 'private_chats', chatId), {
        last_message: content,
        last_message_at: serverTimestamp(),
      });
    } finally {
      setSending(false);
    }
  }, []);

  return { send, sending };
};

// ─────────────────────────────────────────────────────────
// MARK MESSAGES AS SEEN
// ─────────────────────────────────────────────────────────

export const useMarkSeen = () => {
  const markSeen = useCallback(async (chatId: string, viewerId: string) => {
    const q = query(
      collection(db, 'private_messages'),
      where('chat_id', '==', chatId),
      where('sender_id', '!=', viewerId),
      where('is_seen', '==', false)
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await updateDoc(d.ref, { is_seen: true, is_delivered: true });
    }
  }, []);

  return { markSeen };
};

// ─────────────────────────────────────────────────────────
// TYPING INDICATOR (ephemeral via Firestore doc)
// ─────────────────────────────────────────────────────────

export const useTypingIndicator = (chatId: string | null, myId: string) => {
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!chatId) return;

    const typingDocRef = doc(db, 'typing_indicators', chatId);
    const unsub = onSnapshot(typingDocRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const typingUsers = (data.users as Record<string, number>) || {};
      const now = Date.now();
      const otherTyping = Object.entries(typingUsers).some(
        ([uid, ts]) => uid !== myId && now - ts < 4000
      );
      setOtherIsTyping(otherTyping);
      if (otherTyping) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setOtherIsTyping(false), 4000);
      }
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [chatId, myId]);

  const broadcastTyping = useCallback(async () => {
    if (!chatId) return;
    try {
      const typingDocRef = doc(db, 'typing_indicators', chatId);
      const snap = await getDoc(typingDocRef);
      if (snap.exists()) {
        await updateDoc(typingDocRef, { [`users.${myId}`]: Date.now() });
      } else {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(typingDocRef, { users: { [myId]: Date.now() } });
      }
    } catch {
      // Typing indicator failures are non-critical
    }
  }, [chatId, myId]);

  return { otherIsTyping, broadcastTyping };
};

// ─────────────────────────────────────────────────────────
// ALL USER PROFILES (for admin / directory)
// ─────────────────────────────────────────────────────────

export const useAllUserProfiles = () => {
  const [profiles, setProfiles] = useState<UserVerification[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const q = query(collection(db, 'user_verification'), orderBy('user_name'));
    const snap = await getDocs(q);
    setProfiles(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          user_id: data.user_id as string,
          user_name: (data.user_name as string) || '',
          user_avatar: data.user_avatar as string | undefined,
          is_verified: (data.is_verified as boolean) || false,
          verified_at: data.verified_at as string | undefined,
          verified_by: data.verified_by as string | undefined,
          bio: data.bio as string | undefined,
          online_status: (data.online_status as 'online' | 'offline' | 'away') || 'offline',
          last_seen: toIso(data.last_seen),
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
    try {
      const q = query(collection(db, 'user_verification'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, {
          is_verified: !current,
          updated_at: serverTimestamp(),
        });
      }
      return true;
    } catch (err) {
      console.error('[useToggleVerification] Firebase error:', err);
      return false;
    }
  }, []);
  return { toggle };
};
