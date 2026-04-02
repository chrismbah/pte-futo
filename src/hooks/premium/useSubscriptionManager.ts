/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback, useRef } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { notifyUser } from "../../helpers/notifyUser";

const PREMIUM_PRICE = 500;

interface UseSubscriptionManagerProps {
  userID: string | undefined;
  userEmail: string | undefined;
  userName: string | undefined;
}

/**
 * Hook to manage premium subscription auto-renewal.
 * Checks if the subscription has expired and attempts to auto-debit from wallet.
 * If wallet has insufficient funds, revokes premium access.
 */
export const useSubscriptionManager = ({
  userID,
  userEmail,
  userName,
}: UseSubscriptionManagerProps) => {
  const hasChecked = useRef(false);

  const checkAndRenewSubscription = useCallback(async () => {
    if (!userID || !userEmail) return;

    try {
      // Get premium user data
      const premiumRef = doc(db, "premiumUsers", userID);
      const premiumSnap = await getDoc(premiumRef);

      if (!premiumSnap.exists()) return;

      const premiumData = premiumSnap.data();
      
      // Check if subscription is active
      if (!premiumData.active) return;

      // Check if there's an expiration date
      const expiresAt = premiumData.expiresAt?.toDate?.() || premiumData.expiresAt;
      if (!expiresAt) return;

      const now = new Date();
      const expirationDate = new Date(expiresAt);

      // If subscription hasn't expired yet, do nothing
      if (now < expirationDate) return;

      // Subscription has expired - attempt auto-renewal from wallet
      const walletRef = doc(db, "wallets", userID);
      const walletSnap = await getDoc(walletRef);

      if (!walletSnap.exists()) {
        // No wallet found - revoke premium
        await revokePremium(premiumRef, userID, userEmail, "No wallet found for auto-renewal");
        return;
      }

      const walletBalance = walletSnap.data().balance || 0;

      if (walletBalance >= PREMIUM_PRICE) {
        // Sufficient balance - auto-renew subscription
        await autoRenewSubscription(
          premiumRef,
          walletRef,
          walletBalance,
          userID,
          userEmail,
          userName || ""
        );
        notifyUser("success", "Your premium subscription has been auto-renewed for another month!");
      } else {
        // Insufficient balance - revoke premium
        await revokePremium(
          premiumRef,
          userID,
          userEmail,
          `Insufficient wallet balance for auto-renewal. Required: ₦${PREMIUM_PRICE}, Available: ₦${walletBalance}`
        );
        notifyUser(
          "error",
          `Your premium subscription has expired. Auto-renewal failed due to insufficient wallet balance (₦${walletBalance}). Please fund your wallet and resubscribe.`
        );
      }
    } catch (error: any) {
      console.error("[useSubscriptionManager] Error checking subscription:", error);
    }
  }, [userID, userEmail]);

  // Check subscription status on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!userID || hasChecked.current) return;
    hasChecked.current = true;
    checkAndRenewSubscription();
  }, [userID]);

  return { checkAndRenewSubscription };
};

/**
 * Auto-renew subscription by debiting wallet and extending expiration
 */
async function autoRenewSubscription(
  premiumRef: any,
  walletRef: any,
  currentBalance: number,
  userID: string,
  userEmail: string,
  userName: string
) {
  // Set new expiration to 1 month from now
  const newExpiresAt = new Date();
  newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);

  // Debit wallet
  await updateDoc(walletRef, {
    balance: currentBalance - PREMIUM_PRICE,
    updatedAt: serverTimestamp(),
  });

  // Update premium subscription with new expiration
  await updateDoc(premiumRef, {
    expiresAt: newExpiresAt,
    lastRenewalAt: serverTimestamp(),
    autoRenewed: true,
  });

  // Log the transaction
  await addDoc(collection(db, "transactions"), {
    userID,
    userEmail,
    type: "payment",
    amount: PREMIUM_PRICE,
    description: "EBSUMSA Premium Auto-Renewal",
    reference: `ebsu_premium_autorenew_${Date.now()}`,
    status: "success",
    createdAt: serverTimestamp(),
  });

  // Create renewal record for tracking
  await addDoc(collection(db, "premiumRenewals"), {
    userID,
    userEmail,
    userName,
    amount: PREMIUM_PRICE,
    previousBalance: currentBalance,
    newBalance: currentBalance - PREMIUM_PRICE,
    renewedAt: serverTimestamp(),
    newExpiresAt: newExpiresAt,
    type: "auto",
  });
}

/**
 * Revoke premium access due to expired subscription and failed auto-renewal
 */
async function revokePremium(
  premiumRef: any,
  userID: string,
  userEmail: string,
  reason: string
) {
  // Set premium to inactive
  await updateDoc(premiumRef, {
    active: false,
    revokedAt: serverTimestamp(),
    revokeReason: reason,
  });

  // Log the revocation
  await addDoc(collection(db, "premiumRevocations"), {
    userID,
    userEmail,
    reason,
    revokedAt: serverTimestamp(),
  });
}
