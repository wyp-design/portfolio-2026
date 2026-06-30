"use client";

import { useEffect, useRef } from "react";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260616_212935_bbf608da-62d1-4f25-9be4-c346e4d09cc8.mp4";

export function CinematicHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const video = videoRef.current;
    if (!canvas || !root || !video) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let inView = true;
    let running = false;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number }> = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, coarsePointer || saveData ? 1 : 1.35);
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const maximum = coarsePointer || saveData ? 42 : 72;
      const count = Math.max(24, Math.min(maximum, Math.round((canvas.clientWidth * canvas.clientHeight) / 19000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.3 + 0.4,
        alpha: Math.random() * 0.48 + 0.16,
      }));
    };

    const draw = () => {
      if (!running) return;
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0) particle.x = canvas.clientWidth;
        if (particle.x > canvas.clientWidth) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.clientHeight;
        if (particle.y > canvas.clientHeight) particle.y = 0;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255,255,255,${particle.alpha})`;
        context.fill();
      });
      frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || reduceMotion || !inView || document.hidden) return;
      running = true;
      void video.play().catch(() => undefined);
      frame = window.requestAnimationFrame(draw);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
      video.pause();
    };

    const syncActivity = () => {
      if (inView && !document.hidden) start();
      else stop();
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncActivity();
    }, { threshold: 0.02 });

    resize();
    observer.observe(root);
    syncActivity();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", syncActivity);
    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", syncActivity);
    };
  }, []);

  return (
    <div className="cinematic-hero" aria-hidden="true" ref={rootRef}>
      <link rel="preconnect" href="https://d8j0ntlcm91z4.cloudfront.net" crossOrigin="anonymous" />
      <video ref={videoRef} src={VIDEO_URL} muted playsInline loop preload="metadata" />
      <div className="cinematic-hero-overlay" />
      <canvas ref={canvasRef} />
    </div>
  );
}
