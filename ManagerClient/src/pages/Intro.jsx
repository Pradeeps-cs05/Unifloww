// src/pages/Intro.jsx

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Login from "./Login";
import TextFill from "../components/TextFill";
import AbstractBackground from "../assets/Wave2.webp";

const animationConfig = {
  loadingDuration: 0.5,
  holdDuration: 1.5,
  transitionDuration: 1.5,
  ease: "power3.inOut",
};

export default function Intro() {
  const [showLogin, setShowLogin] = useState(false);

  const introWrapperRef = useRef(null);
  const bgRef = useRef(null);       // ref for background image
  const titleRef = useRef(null);    // ref for TextFill wrapper
  const textFillRef = useRef(null); // ref for TextFill component
  const loginRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = !window.matchMedia(
      "(prefers-reduced-motion: no-preference)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(titleRef.current, { opacity: 0 });
      gsap.set(loginRef.current, { opacity: 1 });
      setShowLogin(true);
      return;
    }

    const ctx = gsap.context(() => {
      const progressTracker = { value: 0 };

      // Initial states
      gsap.set(bgRef.current, { scale: 1, opacity: 1, transformOrigin: "center" });
      gsap.set(titleRef.current, { opacity: 0, willChange: "opacity, transform, filter" });
      gsap.set(loginRef.current, { opacity: 0, scale: 0.98 });

      const tl = gsap.timeline();

      // 1. Fade in TextFill container
      tl.to(titleRef.current, { opacity: 1, duration: 2.5 });

      // 2. Animate fill progress
      tl.to(
        progressTracker,
        {
          value: 100,
          duration: animationConfig.loadingDuration,
          ease: "power2.inOut",
          onUpdate: () => {
            if (textFillRef.current?.updateProgress) {
              textFillRef.current.updateProgress(progressTracker.value);
            }
          },
        },
        "-=1.5"
      );

      // 3. Fade out title & blur + cinematic background animation
      tl.to(
        titleRef.current,
        {
          opacity: 0,
          scale: 0.95,
          filter: "blur(10px)",
          duration: animationConfig.transitionDuration,
          ease: animationConfig.ease,
          onStart: () => setShowLogin(true),
        },
        `+=${animationConfig.holdDuration}`
      );

      tl.to(
        bgRef.current,
        {
          scale: 1.05,          // slight zoom
          opacity: 0.7,         // fade slightly
          duration: animationConfig.transitionDuration,
          ease: animationConfig.ease,
        },
        "<" // start simultaneously with title fade-out
      );

      // 4. Fade in Login
      tl.to(
        loginRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: animationConfig.transitionDuration,
          ease: animationConfig.ease,
        },
        "<"
      );
    }, introWrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={introWrapperRef}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* Background */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full z-0 overflow-hidden"
      >
        <img
          src={AbstractBackground}
          alt="Abstract Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* TextFill centered */}
      <div
        ref={titleRef}
        className="absolute inset-0 z-10 flex items-center justify-center"
      >
        <TextFill ref={textFillRef} />
      </div>

      {/* Login appears after animation */}
      <div ref={loginRef} className="absolute inset-0 w-full h-full z-20">
        {showLogin && <Login />}
      </div>

      <noscript>
        <div className="flex justify-center items-center h-screen text-white text-2xl">
          Please enable JavaScript to continue.
        </div>
      </noscript>
    </div>
  );
}
