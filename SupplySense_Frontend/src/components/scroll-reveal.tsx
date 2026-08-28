"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-in" | "fade-left" | "fade-right" | "scale-up" | "blur-in";
  delay?: number; // delay in milliseconds
  duration?: number; // duration in milliseconds
  threshold?: number; // 0.0 to 1.0
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 650,
  threshold = 0.12,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user's motion preferences
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px", // Trigger slightly before it hits the bottom
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold, once]);

  const getAnimationStyles = () => {
    const baseTransition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

    if (!isVisible) {
      switch (animation) {
        case "fade-up":
          return {
            opacity: 0,
            transform: "translateY(28px)",
            transition: baseTransition,
            willChange: "transform, opacity",
          };
        case "fade-in":
          return {
            opacity: 0,
            transition: baseTransition,
            willChange: "opacity",
          };
        case "fade-left":
          return {
            opacity: 0,
            transform: "translateX(-28px)",
            transition: baseTransition,
            willChange: "transform, opacity",
          };
        case "fade-right":
          return {
            opacity: 0,
            transform: "translateX(28px)",
            transition: baseTransition,
            willChange: "transform, opacity",
          };
        case "scale-up":
          return {
            opacity: 0,
            transform: "scale(0.95) translateY(16px)",
            transition: baseTransition,
            willChange: "transform, opacity",
          };
        case "blur-in":
          return {
            opacity: 0,
            filter: "blur(6px)",
            transform: "translateY(20px)",
            transition: baseTransition,
            willChange: "transform, opacity, filter",
          };
        default:
          return {
            opacity: 0,
            transform: "translateY(28px)",
            transition: baseTransition,
            willChange: "transform, opacity",
          };
      }
    }

    return {
      opacity: 1,
      transform: "translateY(0px) translateX(0px) scale(1)",
      filter: "blur(0px)",
      transition: baseTransition,
      willChange: "transform, opacity, filter",
    };
  };

  return (
    <div ref={ref} style={getAnimationStyles()} className={className}>
      {children}
    </div>
  );
}
