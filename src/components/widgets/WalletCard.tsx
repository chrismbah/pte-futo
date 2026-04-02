import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../animation/variants";
import { useWallet } from "../../hooks/wallet/useWallet";
import { Spinner } from "../loaders/Spinner";

interface WalletCardProps {
  userID: string | undefined;
  userEmail: string | undefined;
  className?: string;
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function WalletCard({ userID, userEmail, className = "" }: WalletCardProps) {
  const { wallet, loadingWallet } = useWallet(userID, userEmail);
  const balance = wallet?.balance ?? 0;

  return (
    <NavLink to="/u/wallet">
      <motion.div
        variants={fadeInVariants5}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={16}
        className={`w-full h-[140px] xxss:h-[160px] sss:h-[195px] transition duration-200 ease-in-out rounded-lg p-2 xxss:p-3 sm:p-4 bg-[#00875a]/90 hover:bg-[#00875a] flex flex-col items-center justify-center gap-2 xxss:gap-3 ${className}`}
      >
        {/* Wallet icon */}
        <svg
          className="w-[36px] h-[36px] xxss:w-[44px] xxss:h-[44px] sm:w-[60px] sm:h-[60px] mmd:h-14 mmd:w-14 xl:w-16 xl:h-16 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.6}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>

        {loadingWallet ? (
          <Spinner className="w-4 h-4 text-white" />
        ) : (
          <div className="text-center">
            <p className="text-white text-xss xxss:text-xs font-bold leading-none">
              {formatNaira(balance)}
            </p>
            <p className="uppercase text-white/80 text-sss xxss:text-xss sm:text-xs font-semibold mt-0.5">
              My Wallet
            </p>
          </div>
        )}
      </motion.div>
    </NavLink>
  );
}
