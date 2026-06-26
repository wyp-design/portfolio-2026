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
        { yPercent: 14, rotateX: -28, rotateY: 18, opacity: 0 },
        {
          yPercent: 0,
          rotateX: 0,
          rotateY: 0,
          opacity: 1,
          duration: 1.05,
          ease: "power3.out",
          stagger: 0.08,
        },
      );

      gsap.to(".hello-letter", {
        y: "random(-18, 18)",
        rotateY: "random(-10, 10)",
        rotateX: "random(-6, 8)",
        duration: 3.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.18,
      });

      gsap.to(".hello-shadow", {
        x: 16,
        y: 18,
        duration: 4.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
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
      <div className="hello-orbit" />
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
