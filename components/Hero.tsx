"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

const headline = ["Nature's Finest,", "Perfectly Crafted."];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 36]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduce) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, [reduce]);

  return (
    <section
      ref={ref}
      className="hero-shell grain relative min-h-dvh overflow-hidden bg-espresso"
    >
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay={!reduce}
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero/hero-composition.webp"
        aria-hidden
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="hero-video-shade pointer-events-none absolute inset-0" />
      <div className="hero-vignette pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1440px] items-center px-5 pt-[72px] pb-16 md:px-10">
        <motion.div
          style={reduce ? undefined : { y: contentY, opacity }}
          className="flex max-w-xl flex-col justify-center py-12 lg:py-0"
        >
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="hero-badge"
          >
            Premium • Naturally Sourced
          </motion.p>

          <h1 className="mt-7">
            {headline.map((line, lineIndex) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 1.05,
                    delay: 0.28 + lineIndex * 0.14,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`block font-serif leading-[0.92] tracking-tight ${
                    lineIndex === 0
                      ? "text-[2.85rem] text-ivory sm:text-6xl md:text-7xl lg:text-[4.6rem] xl:text-[5.4rem]"
                      : "text-[2.85rem] italic text-champagne sm:text-6xl md:text-7xl lg:text-[4.6rem] xl:text-[5.4rem]"
                  }`}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.62 }}
            className="mt-8 max-w-[22rem] text-[15px] leading-[1.8] text-ivory/70 md:text-base"
          >
            Premium dry fruits, carefully selected for exceptional taste, freshness,
            and quality.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.78 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <Link href="/shop" className="hero-cta-primary group">
              <span>Shop Collection</span>
              <ArrowRight
                size={15}
                strokeWidth={1.5}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </Link>
            <Link href="/story" className="hero-cta-secondary">
              Explore Our Story
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={reduce ? undefined : { opacity }}
        className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
      >
        <span className="text-[9px] uppercase tracking-[0.36em] text-ivory/35">Scroll</span>
        <span className="hero-scroll-line" />
      </motion.div>
    </section>
  );
}
