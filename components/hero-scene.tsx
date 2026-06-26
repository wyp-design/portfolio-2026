"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const letters = ["H", "E", "L", "L", "O"];

export function HeroScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        ".hello-letter",
        { yPercent: 24, rotateX: -34, rotateY: 24, opacity: 0, scale: 0.92 },
        {
          yPercent: 0,
          rotateX: 0,
          rotateY: -8,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.07,
        },
      );

      gsap.to(".hello-letter", {
        y: "random(-12, 16)",
        rotateY: "random(-14, 8)",
        rotateX: "random(-5, 7)",
        duration: 3.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.18,
      });

      gsap.to(".hello-shadow", {
        x: 22,
        y: 24,
        duration: 4.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(".hello-slab", {
        x: "random(-18, 20)",
        y: "random(-12, 16)",
        rotate: "random(-8, 8)",
        duration: 5.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.24,
      });

      gsap.to(".hello-orbit", {
        rotate: 360,
        duration: 18,
        ease: "none",
        repeat: -1,
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <div className="hero-scene hero-hello-scene" ref={root} aria-hidden="true">
      <div className="hello-glow hello-glow-one" />
      <div className="hello-glow hello-glow-two" />
      <div className="hello-orbit" />
      <div className="hello-slab hello-slab-one" />
      <div className="hello-slab hello-slab-two" />
      <div className="hello-word">
        <span className="hello-shadow">HELLO</span>
        {letters.map((letter, index) => (
          <span className="hello-letter" data-letter={letter} key={`${letter}-${index}`}>
            {letter}
          </span>
        ))}
      </div>
      <span className="hello-pill hello-pill-one">UI</span>
      <span className="hello-pill hello-pill-two">UX</span>
      <span className="hello-pill hello-pill-three">AI</span>
    </div>
  );
}
