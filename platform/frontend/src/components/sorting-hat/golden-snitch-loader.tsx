"use client";

import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GoldenSnitchLoaderProps {
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  onComplete?: () => void;
}

// ─── Golden Snitch SVG ───────────────────────────────────────────────────────

function SnitchBody({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Golden Snitch</title>
      {/* Body */}
      <circle cx="30" cy="30" r="14" fill="url(#goldGradient)" stroke="#B8860B" strokeWidth="1.5" />
      {/* Wings */}
      <motion.path
        d="M16 25 C10 20, 5 25, 8 30 C5 35, 10 38, 16 33"
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth="0.5"
        animate={{
          d: [
            "M16 25 C10 20, 5 25, 8 30 C5 35, 10 38, 16 33",
            "M16 25 C10 22, 5 28, 8 30 C5 32, 10 36, 16 33",
            "M16 25 C10 20, 5 25, 8 30 C5 35, 10 38, 16 33",
          ],
        }}
        transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M44 25 C50 20, 55 25, 52 30 C55 35, 50 38, 44 33"
        fill="#FFD700"
        stroke="#B8860B"
        strokeWidth="0.5"
        animate={{
          d: [
            "M44 25 C50 20, 55 25, 52 30 C55 35, 50 38, 44 33",
            "M44 25 C50 22, 55 28, 52 30 C55 32, 50 36, 44 33",
            "M44 25 C50 20, 55 25, 52 30 C55 35, 50 38, 44 33",
          ],
        }}
        transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Center detail */}
      <circle cx="30" cy="30" r="4" fill="#B8860B" />
      <circle cx="30" cy="30" r="2" fill="#FFD700" />
      {/* Gradient */}
      <defs>
        <radialGradient id="goldGradient" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#FFE44D" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function GoldenSnitchLoader({
  isActive = true,
  size = "md",
  onComplete,
}: GoldenSnitchLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  if (!isActive) return null;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Snitch with flight path */}
      <motion.div
        className={sizeClasses[size]}
        animate={{
          x: [0, 20, -15, 10, -20, 15, 0],
          y: [0, -15, 10, -20, 15, -10, 0],
          rotate: [0, 10, -10, 15, -15, 5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <SnitchBody className="w-full h-full drop-shadow-lg" />
      </motion.div>

      {/* Trail effect */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-yellow-400/40"
          animate={{
            x: [0, -20 + i * 5, 15 - i * 3, 0],
            y: [0, 10 - i * 2, -15 + i * 3, 0],
            opacity: [0.6, 0.2, 0.6],
            scale: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </motion.div>
  );
}

// ─── Inline loader for tool calls ────────────────────────────────────────────

export function SnitchToolCallLoader({ toolName }: { toolName: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
      <GoldenSnitchLoader size="sm" />
      <div className="flex-1">
        <p className="text-sm font-medium text-yellow-200">
          Tool call in flight
        </p>
        <p className="text-xs text-yellow-200/60 font-mono">
          {toolName}
        </p>
      </div>
      <motion.div
        className="flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {["⚡", "✨", "⚡"].map((emoji, i) => (
          <motion.span
            key={i}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
