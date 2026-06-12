"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Spark } from "@/components/ui/wordmark";

// The one signature element: a single focal word that cycles. Everything else is quiet.
const WORDS = ["apps people love", "sites that convert", "brands that mean it", "growth you can measure"];
const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return; // honor reduced-motion: no cycling
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2400);
    return () => clearInterval(id);
  }, [reduce]);

  const enter = reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <section className="relative overflow-hidden">
      {/* Quiet signature backdrop — a single oversized spark, low contrast. */}
      <Spark
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-[28rem] text-brand/[0.06] sm:-right-24"
      />
      <Container className="relative py-24 sm:py-32 lg:py-40">
        <motion.p
          {...enter}
          transition={{ duration: 0.5, ease: EASE }}
          className="font-display text-sm font-semibold tracking-widest text-brand uppercase"
        >
          Digital agency · Addis Ababa
        </motion.p>

        <motion.h1
          {...enter}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
          aria-label="We build apps people love, sites that convert, brands that mean it, and growth you can measure."
          className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] font-semibold text-balance sm:text-7xl"
        >
          <span aria-hidden>
            We build
            <br />
            <span className="relative inline-block text-brand">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={WORDS[i]}
                  initial={reduce ? false : { y: "0.45em", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: "-0.45em", opacity: 0 }}
                  transition={{ duration: 0.38, ease: EASE }}
                  className="inline-block"
                >
                  {WORDS[i]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </motion.h1>

        <motion.p
          {...enter}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="mt-8 max-w-xl text-lg text-ink-soft text-pretty"
        >
          App development, full digitalization, marketing, and landing pages — for
          businesses that want to mean something online.
        </motion.p>

        <motion.div
          {...enter}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Button href="/start-a-project">Start a project</Button>
          <Button href="/projects" variant="outline">
            See our work
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
