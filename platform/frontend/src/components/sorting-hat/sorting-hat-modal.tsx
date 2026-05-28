"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

type House = "gryffindor" | "slytherin" | "ravenclaw" | "hufflepuff";

interface SortingResult {
  house: House;
  confidence: number;
  color: string;
  emoji: string;
  risk: "low" | "medium" | "high";
  monologue: string;
}

interface SortingHatModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  toolDescription: string;
  onSorted?: (result: SortingResult) => void;
}

// ─── House colors & styling ──────────────────────────────────────────────────

const HOUSE_STYLES: Record<House, { bg: string; text: string; border: string; glow: string }> = {
  gryffindor: {
    bg: "bg-gradient-to-br from-red-900/80 to-red-950/90",
    text: "text-red-200",
    border: "border-red-700",
    glow: "shadow-red-500/20",
  },
  slytherin: {
    bg: "bg-gradient-to-br from-green-900/80 to-green-950/90",
    text: "text-green-200",
    border: "border-green-700",
    glow: "shadow-green-500/20",
  },
  ravenclaw: {
    bg: "bg-gradient-to-br from-blue-900/80 to-blue-950/90",
    text: "text-blue-200",
    border: "border-blue-700",
    glow: "shadow-blue-500/20",
  },
  hufflepuff: {
    bg: "bg-gradient-to-br from-yellow-900/80 to-yellow-950/90",
    text: "text-yellow-200",
    border: "border-yellow-700",
    glow: "shadow-yellow-500/20",
  },
};

// ─── Sorting Hat SVG ─────────────────────────────────────────────────────────

function SortingHatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Sorting Hat</title>
      {/* Hat brim */}
      <ellipse cx="50" cy="75" rx="45" ry="12" fill="#3D2B1F" stroke="#2A1F15" strokeWidth="2" />
      {/* Hat body */}
      <path
        d="M20 75 C20 45, 35 15, 50 10 C65 15, 80 45, 80 75"
        fill="#4A3728"
        stroke="#2A1F15"
        strokeWidth="2"
      />
      {/* Hat tip drooping */}
      <path
        d="M50 10 C48 15, 42 20, 35 22"
        fill="none"
        stroke="#2A1F15"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Eyes */}
      <circle cx="40" cy="50" r="4" fill="#1A1A1A" />
      <circle cx="60" cy="50" r="4" fill="#1A1A1A" />
      {/* Mouth */}
      <path
        d="M42 62 Q50 68, 58 62"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Stitch lines */}
      <path d="M35 35 L38 45 L35 55" fill="none" stroke="#2A1F15" strokeWidth="1" />
      <path d="M65 35 L62 45 L65 55" fill="none" stroke="#2A1F15" strokeWidth="1" />
    </svg>
  );
}

// ─── Streaming monologue component ───────────────────────────────────────────

function StreamingMonologue({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30); // Speed of typing effect
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <motion.p
      className="text-sm leading-relaxed text-muted-foreground italic"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      &ldquo;{displayText}&rdquo;
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </motion.p>
  );
}

// ─── House badge component ───────────────────────────────────────────────────

function HouseBadge({ house }: { house: House }) {
  const style = HOUSE_STYLES[house];
  const labels: Record<House, string> = {
    gryffindor: "Gryffindor",
    slytherin: "Slytherin",
    ravenclaw: "Ravenclaw",
    hufflepuff: "Hufflepuff",
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <Badge
        className={`${style.bg} ${style.text} ${style.border} border-2 px-6 py-3 text-lg font-bold shadow-lg ${style.glow}`}
      >
        {house === "gryffindor" && "🦁 "}
        {house === "slytherin" && "🐍 "}
        {house === "ravenclaw" && "🦅 "}
        {house === "hufflepuff" && "🦡 "}
        {labels[house]}
      </Badge>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function SortingHatModal({
  isOpen,
  onClose,
  toolName,
  toolDescription,
  onSorted,
}: SortingHatModalProps) {
  const [phase, setPhase] = useState<"thinking" | "sorting" | "result">("thinking");
  const [result, setResult] = useState<SortingResult | null>(null);
  const [monologueComplete, setMonologueComplete] = useState(false);

  const startSorting = useCallback(async () => {
    setPhase("thinking");

    // Simulate thinking delay for dramatic effect
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setPhase("sorting");

    // In real implementation, this would call the backend API
    // For now, simulate the sorting
    const mockResult: SortingResult = {
      house: toolDescription.toLowerCase().includes("delete") ? "slytherin" :
             toolDescription.toLowerCase().includes("read") ? "gryffindor" :
             toolDescription.toLowerCase().includes("analyze") ? "ravenclaw" : "hufflepuff",
      confidence: 0.85,
      color: "#740001",
      emoji: "🦁",
      risk: "low",
      monologue: `Hmm, I see... yes, I see it clearly. A brave tool, this one. It seeks to illuminate, to discover, to reveal what is hidden. I am quite certain! 🦁 — GRYFFINDOR! (confidence: 85%)`,
    };

    setResult(mockResult);
    setPhase("result");
    onSorted?.(mockResult);
  }, [toolName, toolDescription, onSorted]);

  useEffect(() => {
    if (isOpen) {
      startSorting();
    } else {
      // Reset state when modal closes
      setPhase("thinking");
      setResult(null);
      setMonologueComplete(false);
    }
  }, [isOpen, startSorting]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SortingHatIcon className="w-8 h-8" />
            <span>The Sorting Hat</span>
          </DialogTitle>
          <DialogDescription>
            Sorting <span className="font-mono font-semibold">{toolName}</span> into a house...
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          <AnimatePresence mode="wait">
            {phase === "thinking" && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <SortingHatIcon className="w-24 h-24" />
                </motion.div>
                <p className="text-muted-foreground animate-pulse">
                  Hmm, let me think...
                </p>
              </motion.div>
            )}

            {phase === "sorting" && (
              <motion.div
                key="sorting"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <SortingHatIcon className="w-24 h-24" />
                </motion.div>
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {(["gryffindor", "slytherin", "ravenclaw", "hufflepuff"] as House[]).map(
                    (house, i) => (
                      <motion.div
                        key={house}
                        className={`w-3 h-3 rounded-full ${
                          house === "gryffindor" ? "bg-red-500" :
                          house === "slytherin" ? "bg-green-500" :
                          house === "ravenclaw" ? "bg-blue-500" : "bg-yellow-500"
                        }`}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    )
                  )}
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  The Sorting Hat is deliberating...
                </p>
              </motion.div>
            )}

            {phase === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                {/* House result */}
                <HouseBadge house={result.house} />

                {/* Streaming monologue */}
                <div className="w-full px-4">
                  <StreamingMonologue
                    text={result.monologue}
                    onComplete={() => setMonologueComplete(true)}
                  />
                </div>

                {/* Confidence & risk */}
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-lg font-bold">{Math.round(result.confidence * 100)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Risk Level</p>
                    <Badge
                      variant={
                        result.risk === "high" ? "destructive" :
                        result.risk === "medium" ? "secondary" : "default"
                      }
                    >
                      {result.risk}
                    </Badge>
                  </div>
                </div>

                {/* Close button */}
                {monologueComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button onClick={onClose}>
                      Accept Sorting
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
