"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, useTransform } from "framer-motion";
import { Spark } from "@/components/ui/wordmark";

// The site's one orchestrated motion moment. Two soft brand/ember glows and the
// signature spark drift gently and parallax toward the pointer. Quiet, premium,
// and fully disabled for prefers-reduced-motion (renders a static backdrop).
export function HeroBackdrop() {
  const reduce = useReducedMotion();

  // Pointer position, normalised to [-1, 1], smoothed with a spring.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 20 });
  const sy = useSpring(py, { stiffness: 40, damping: 20 });

  const glowX = useTransform(sx, (v) => v * 28);
  const glowY = useTransform(sy, (v) => v * 28);
  const sparkX = useTransform(sx, (v) => v * -18);
  const sparkY = useTransform(sy, (v) => v * -18);
  const sparkRot = useTransform(sx, (v) => v * 6);
  const emberX = useTransform(glowX, (v) => -v * 0.7);
  const emberY = useTransform(glowY, (v) => -v * 0.7);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py, reduce]);

  if (reduce) {
    // Static, low-contrast backdrop — no animation.
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 size-[34rem] rounded-full bg-brand/[0.07] blur-3xl" />
        <Spark className="absolute -top-16 -right-16 size-[28rem] text-brand/[0.06]" />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Brand glow */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="absolute -top-32 -right-24 size-[36rem] rounded-full bg-brand/[0.08] blur-3xl"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Ember glow — the one rare warm highlight */}
      <motion.div
        style={{ x: emberX, y: emberY }}
        className="absolute top-1/3 -left-24 size-[26rem] rounded-full bg-ember/[0.06] blur-3xl"
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Signature spark — drifts + counter-parallax */}
      <motion.div
        style={{ x: sparkX, y: sparkY, rotate: sparkRot }}
        className="absolute -top-16 -right-16 sm:-right-24"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <Spark className="size-[28rem] text-brand/[0.07]" />
      </motion.div>
    </div>
  );
}
