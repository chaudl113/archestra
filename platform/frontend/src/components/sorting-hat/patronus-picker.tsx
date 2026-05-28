"use client";

import { useState, useEffect } from "react";
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

interface PatronusResult {
  form: string;
  corporeal: boolean;
  message: string;
}

interface PatronusPickerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSelected?: (patronus: PatronusResult) => void;
}

// ─── Patronus form icons ─────────────────────────────────────────────────────

const PATRONUS_ICONS: Record<string, string> = {
  otter: "🦦",
  stag: "🦌",
  doe: "🦌",
  phoenix: "🦅",
  dragon: "🐉",
  wolf: "🐺",
  fox: "🦊",
  hare: "🐇",
  swan: "🦢",
  ocelot: "🐱",
  lynx: "🐱",
  boar: "🐗",
  horse: "🐴",
  weasel: "🐹",
  hound: "🐕",
  eagle: "🦅",
  hawk: "🦅",
  cat: "🐱",
  dog: "🐕",
  rabbit: "🐇",
  badger: "🦡",
  serpent: "🐍",
  dolphin: "🐬",
  whale: "🐋",
  bear: "🐻",
  tiger: "🐅",
  lion: "🦁",
  elephant: "🐘",
  owl: "🦉",
};

// ─── Canvas animation for Patronus ───────────────────────────────────────────

function PatronusAnimation({ form, corporeal }: { form: string; corporeal: boolean }) {
  const icon = PATRONUS_ICONS[form] || "✨";

  return (
    <motion.div
      className="relative flex items-center justify-center w-48 h-48"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
    >
      {/* Glow effect */}
      <motion.div
        className={`absolute inset-0 rounded-full ${
          corporeal
            ? "bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20"
            : "bg-gradient-to-r from-gray-400/10 via-gray-300/10 to-gray-400/10"
        }`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Patronus form */}
      <motion.div
        className={`text-8xl ${
          corporeal ? "" : "opacity-50 grayscale"
        }`}
        animate={corporeal ? {
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        } : {
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {icon}
      </motion.div>

      {/* Sparkles for corporeal */}
      {corporeal && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-300 rounded-full"
              style={{
                top: "50%",
                left: "50%",
              }}
              animate={{
                x: [0, Math.cos(i * 45 * Math.PI / 180) * 80],
                y: [0, Math.sin(i * 45 * Math.PI / 180) * 80],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function PatronusPicker({
  isOpen,
  onClose,
  userId,
  onSelected,
}: PatronusPickerProps) {
  const [phase, setPhase] = useState<"casting" | "result">("casting");
  const [patronus, setPatronus] = useState<PatronusResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      castPatronus();
    } else {
      setPhase("casting");
      setPatronus(null);
    }
  }, [isOpen]);

  const castPatronus = async () => {
    setPhase("casting");

    // Simulate casting delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In real implementation, call backend API
    // For now, deterministic mock based on userId
    const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const forms = Object.keys(PATRONUS_ICONS);
    const form = forms[hash % forms.length];
    const corporeal = (hash % 5) !== 0; // 80% corporeal

    const result: PatronusResult = {
      form,
      corporeal,
      message: corporeal
        ? `✨ Expecto Patronum! A magnificent ${form} materializes in silver light!`
        : `✨ Expecto Patronum... A faint wisp of a ${form} appears, but it is not corporeal.`,
    };

    setPatronus(result);
    setPhase("result");
    onSelected?.(result);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>✨</span>
            <span>Cast Your Patronus</span>
          </DialogTitle>
          <DialogDescription>
            Expecto Patronum! Your Patronus is derived from your user essence.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          <AnimatePresence mode="wait">
            {phase === "casting" && (
              <motion.div
                key="casting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  className="text-6xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🪄
                </motion.div>
                <motion.p
                  className="text-muted-foreground"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Casting Expecto Patronum...
                </motion.p>
              </motion.div>
            )}

            {phase === "result" && patronus && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <PatronusAnimation
                  form={patronus.form}
                  corporeal={patronus.corporeal}
                />

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold capitalize">
                    {patronus.form}
                  </h3>
                  <Badge
                    variant={patronus.corporeal ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {patronus.corporeal ? "Corporeal ✨" : "Non-Corporeal 💨"}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  {patronus.message}
                </p>

                {!patronus.corporeal && (
                  <p className="text-xs text-yellow-500 text-center">
                    ⚠️ Non-corporeal Patronus will fail authorization for Slytherin-sorted tools.
                  </p>
                )}

                <Button onClick={onClose}>
                  Accept Patronus
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
