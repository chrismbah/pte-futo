/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase";

export interface WalletTransaction {
  id: string;
  type: "fund" | "payment" | "transfer_in" | "transfer_out" | "withdrawal_request";
  amount: number;
  description: string;
  reference?: string;
  status: "success" | "pending" | "failed";
  createdAt: any;
  recipientEmail?: string;
  senderEmail?: string;
}

export interface Wallet {
  userID: string;
  balance: number;
  createdAt: any;
  updatedAt: any;
}

export const useWallet = (userID: string | undefined, userEmail: string | undefined) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Real-time wallet listener — creates wallet doc if it doesn't exist
  useEffect(() => {
    if (!userID) {
      setLoadingWallet(false);
      return;
    }
    const walletRef = doc(db, "wallets", userID);

    // First check if wallet exists; create it if not, then subscribe
    const initWallet = async () => {
      const snap = await getDoc(walletRef);
      if (!snap.exists()) {
        await setDoc(walletRef, {
          userID,
          balance: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    };

    initWallet().catch(console.error);

    const unsubscribe = onSnapshot(walletRef, (snap) => {
      if (snap.exists()) {
        setWallet(snap.data() as Wallet);
      } else {
        // Doc doesn't exist yet (race condition) — show zero balance
        setWallet({ userID, balance: 0, createdAt: null, updatedAt: null });
      }
      setLoadingWallet(false);
    }, (err) => {
      console.error("[useWallet] wallet snapshot error:", err);
      setLoadingWallet(false);
    });
    return () => unsubscribe();
  }, [userID]);

  // Real-time transactions listener
  useEffect(() => {
    if (!userID) return;
    setLoadingTransactions(true);
    // Query without orderBy to avoid needing a composite index; sort client-side
    const q = query(
      collection(db, "transactions"),
      where("userID", "==", userID)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const txns: WalletTransaction[] = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<WalletTransaction, "id">) }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });
      setTransactions(txns);
      setLoadingTransactions(false);
    }, (err) => {
      console.error("[useWallet] transactions snapshot error:", err);
      setLoadingTransactions(false);
    });
    return () => unsubscribe();
  }, [userID]);

  // Keep fetchTransactions as a manual refresh no-op (transactions update in real-time)
  const fetchTransactions = async () => {
    // no-op — data is live via onSnapshot
  };

  // Credit wallet after successful Paystack payment
  const fundWallet = async (amount: number, reference: string) => {
    if (!userID || !userEmail) throw new Error("Not authenticated");
    const walletRef = doc(db, "wallets", userID);
    const walletSnap = await getDoc(walletRef);
    const currentBalance = walletSnap.exists() ? walletSnap.data().balance : 0;
    await updateDoc(walletRef, {
      balance: currentBalance + amount,
      updatedAt: serverTimestamp(),
    });
    await addDoc(collection(db, "transactions"), {
      userID,
      userEmail,
      type: "fund",
      amount,
      description: `Wallet funded via Paystack`,
      reference,
      status: "success",
      createdAt: serverTimestamp(),
    });
  };

  // Pay for something using wallet balance
  const payWithWallet = async (amount: number, description: string) => {
    if (!userID || !userEmail) throw new Error("Not authenticated");
    const walletRef = doc(db, "wallets", userID);
    const walletSnap = await getDoc(walletRef);
    if (!walletSnap.exists()) throw new Error("Wallet not found");
    const currentBalance = walletSnap.data().balance;
    if (currentBalance < amount) throw new Error("Insufficient wallet balance");
    await updateDoc(walletRef, {
      balance: currentBalance - amount,
      updatedAt: serverTimestamp(),
    });
    await addDoc(collection(db, "transactions"), {
      userID,
      userEmail,
      type: "payment",
      amount,
      description,
      status: "success",
      createdAt: serverTimestamp(),
    });
  };

  // Transfer to another user by email
  const transferToUser = async (recipientEmail: string, amount: number) => {
    if (!userID || !userEmail) throw new Error("Not authenticated");
    if (recipientEmail.trim().toLowerCase() === userEmail.trim().toLowerCase())
      throw new Error("You cannot transfer to yourself");
    if (amount <= 0) throw new Error("Enter a valid amount");

    // 1. Check sender balance first
    const senderWalletRef = doc(db, "wallets", userID);
    const senderSnap = await getDoc(senderWalletRef);
    if (!senderSnap.exists() || senderSnap.data().balance < amount)
      throw new Error("Insufficient wallet balance");

    // 2. Find recipient in userInfo by email
    const userInfoQ = query(
      collection(db, "userInfo"),
      where("email", "==", recipientEmail.trim().toLowerCase())
    );
    const userInfoSnap = await getDocs(userInfoQ);

    // Also try non-lowercase version in case email was stored as entered
    let recipientDoc = userInfoSnap.docs[0];
    if (!recipientDoc) {
      const userInfoQ2 = query(
        collection(db, "userInfo"),
        where("email", "==", recipientEmail.trim())
      );
      const userInfoSnap2 = await getDocs(userInfoQ2);
      recipientDoc = userInfoSnap2.docs[0];
    }

    if (!recipientDoc) throw new Error("No EBSUMSA account found with that email address");

    const recipientUserID = recipientDoc.data().userID;
    if (!recipientUserID) throw new Error("Recipient account is incomplete. Please contact support.");

    const recipientWalletRef = doc(db, "wallets", recipientUserID);
    const recipientSnap = await getDoc(recipientWalletRef);
    const recipientBalance = recipientSnap.exists() ? recipientSnap.data().balance : 0;

    // 3. Debit sender
    await updateDoc(senderWalletRef, {
      balance: senderSnap.data().balance - amount,
      updatedAt: serverTimestamp(),
    });

    // 4. Credit recipient (create wallet if it doesn't exist)
    if (recipientSnap.exists()) {
      await updateDoc(recipientWalletRef, {
        balance: recipientBalance + amount,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(recipientWalletRef, {
        userID: recipientUserID,
        balance: amount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // 5. Log transactions for both parties
    await addDoc(collection(db, "transactions"), {
      userID,
      userEmail,
      type: "transfer_out",
      amount,
      description: `Transfer to ${recipientEmail.trim()}`,
      recipientEmail: recipientEmail.trim(),
      status: "success",
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "transactions"), {
      userID: recipientUserID,
      userEmail: recipientEmail.trim(),
      type: "transfer_in",
      amount,
      description: `Transfer received from ${userEmail}`,
      senderEmail: userEmail,
      status: "success",
      createdAt: serverTimestamp(),
    });
  };

  // Submit a withdrawal request (admin approves manually)
  const requestWithdrawal = async (amount: number, bankName: string, accountNumber: string, accountName: string) => {
    if (!userID || !userEmail) throw new Error("Not authenticated");
    const walletRef = doc(db, "wallets", userID);
    const walletSnap = await getDoc(walletRef);
    if (!walletSnap.exists() || walletSnap.data().balance < amount)
      throw new Error("Insufficient wallet balance");

    // Deduct immediately and hold pending
    await updateDoc(walletRef, {
      balance: walletSnap.data().balance - amount,
      updatedAt: serverTimestamp(),
    });

    // Create withdrawal request
    await addDoc(collection(db, "withdrawalRequests"), {
      userID,
      userEmail,
      amount,
      bankName,
      accountNumber,
      accountName,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // Log transaction
    await addDoc(collection(db, "transactions"), {
      userID,
      userEmail,
      type: "withdrawal_request",
      amount,
      description: `Withdrawal request to ${bankName} - ${accountNumber}`,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  };

  return {
    wallet,
    loadingWallet,
    transactions,
    loadingTransactions,
    fetchTransactions,
    fundWallet,
    payWithWallet,
    transferToUser,
    requestWithdrawal,
  };
};
