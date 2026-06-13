"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The one signature motion element: a single focal word that cycles.
 * The first word is server-rendered and visible immediately — only the
 * cycling is client-side, so the headline never waits on hydration.
 */
export function RotatingWord({ words }: { words: string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return; // honor reduced-motion: no cycling
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, [reduce, words.length]);

  return (
    <span className="relative inline-block text-brand">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          initial={reduce ? false : { y: "0.45em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: "-0.45em", opacity: 0 }}
          transition={{ duration: 0.38, ease: EASE }}
          className="inline-block"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
