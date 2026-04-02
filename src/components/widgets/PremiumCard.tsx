/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInVariants5 } from "../../animation/variants";
import { db } from "../../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface PremiumCardProps {
  userID: string;
  userEmail: string;
}

export default function PremiumCard({ userID }: PremiumCardProps) {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!userID) return;
    const unsub = onSnapshot(doc(db, "premiumUsers", userID), (snap) => {
      setIsPremium(snap.exists() && snap.data()?.active === true);
    });
    return () => unsub();
  }, [userID]);

  // Particle orbs + flowing arcs animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      radius: number; opacity: number; hue: number; phase: number;
    };

    const W = () => canvas.width;
    const H = () => canvas.height;

    const particles: Particle[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.6,
      hue: 38 + Math.random() * 25,
      phase: Math.random() * Math.PI * 2,
    }));

    // Arcs connecting nearby particles
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W(), H());
      t += 0.012;

      // Update & draw particles
      particles.forEach((p, i) => {
        p.x += p.vx + Math.sin(t + p.phase) * 0.25;
        p.y += p.vy + Math.cos(t + p.phase * 0.7) * 0.25;
        if (p.x < 0) p.x = W();
        if (p.x > W()) p.x = 0;
        if (p.y < 0) p.y = H();
        if (p.y > H()) p.y = 0;

        // Pulse radius
        const r = p.radius + Math.sin(t * 1.5 + p.phase) * 0.5;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        grd.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${p.opacity})`);
        grd.addColorStop(1, `hsla(${p.hue}, 90%, 70%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Draw arc to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.min(W(), H()) * 0.55;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `hsla(${(p.hue + q.hue) / 2}, 85%, 65%, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", setSize);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <motion.div
      variants={fadeInVariants5}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      custom={16}
      onClick={() => navigate("/u/premium")}
      className="relative overflow-hidden rounded-lg cursor-pointer h-[140px] xxss:h-[160px] sss:h-[195px] group"
      style={{ background: "linear-gradient(145deg, #12001f 0%, #1a0035 40%, #0d0020 100%)" }}
    >
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Radial glow center */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 60%, rgba(251,191,36,0.12) 0%, transparent 70%)"
      }} />

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)" }} />

      {/* Border */}
      <div className="absolute inset-0 rounded-lg pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.25), 0 0 18px rgba(251,191,36,0.08)" }} />

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 1.5px rgba(251,191,36,0.5), 0 0 32px rgba(251,191,36,0.15)" }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-1.5 p-2 xxss:p-3">
        {/* Crown with glow ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-10 h-10 rounded-full animate-ping"
            style={{ background: "rgba(251,191,36,0.08)", animationDuration: "2.5s" }} />
          <div className="relative w-7 h-7 xxss:w-9 xxss:h-9 sm:w-12 sm:h-12 flex items-center justify-center">
            <svg viewBox="0 0 40 32" fill="none" className="w-full h-full drop-shadow-lg">
              <defs>
                <linearGradient id="cg1" x1="0" y1="0" x2="40" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <filter id="glow1"><feGaussianBlur stdDeviation="1.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <path d="M4 28l3-15 7.5 7L20 4l5.5 16L34 9l3 19H4z"
                fill="url(#cg1)" stroke="#fbbf24" strokeWidth="1.2" strokeLinejoin="round" filter="url(#glow1)" />
              <circle cx="4" cy="13" r="2.5" fill="#fbbf24" opacity="0.9" />
              <circle cx="20" cy="4" r="2.5" fill="#fde68a" opacity="0.9" />
              <circle cx="36" cy="9" r="2.5" fill="#fbbf24" opacity="0.9" />
              <rect x="4" y="28" width="32" height="3" rx="1.5" fill="url(#cg1)" opacity="0.7" />
            </svg>
          </div>
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="font-black uppercase tracking-widest text-sss xxss:text-xss sm:text-xs leading-tight"
            style={{ background: "linear-gradient(90deg, #fde68a, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Premium
          </p>
          <p className="text-white/60 font-medium leading-tight"
            style={{ fontSize: "clamp(7px, 1.8vw, 10px)" }}>
            Package
          </p>
        </div>

        {/* Badge */}
        {isPremium ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xss font-bold"
            style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.5)", color: "#fbbf24" }}>
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Active
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xss font-semibold"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Tap to unlock
          </div>
        )}
      </div>
    </motion.div>
  );
}
