"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function HeroScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        ".hello-script",
        { yPercent: 20, rotateX: -26, rotateY: 12, opacity: 0, scale: 0.92 },
        {
          yPercent: 0,
          rotateX: 0,
          rotateY: -4,
          opacity: 1,
          scale: 1,
          duration: 1.15,
          ease: "expo.out",
        },
      );

      gsap.to(".hello-script", {
        y: "random(-10, 14)",
        rotateY: "random(-5, 5)",
        rotateX: "random(-2, 4)",
        duration: 4.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(".hello-orb", {
        x: "random(-18, 18)",
        y: "random(-14, 16)",
        rotate: "random(-14, 14)",
        duration: 4.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
      });

      gsap.to(".hello-stamp", {
        rotate: "+=360",
        duration: 24,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".hello-grain", {
        xPercent: -4,
        yPercent: 3,
        duration: 6,
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
      <div className="hello-glow hello-glow-one" />
      <div className="hello-glow hello-glow-two" />
      <div className="hello-orbit" />
      <div className="hello-grain" />
      <div className="hello-stamp">SYSTEM<br />MEMORY</div>
      <div className="hello-orb hello-orb-one" />
      <div className="hello-orb hello-orb-two" />
      <div className="hello-word">
        <span className="hello-script">hello</span>
      </div>
      <span className="hello-pill hello-pill-one">UI</span>
      <span className="hello-pill hello-pill-two">UX</span>
      <span className="hello-pill hello-pill-three">AI</span>
    </div>
  );
}
