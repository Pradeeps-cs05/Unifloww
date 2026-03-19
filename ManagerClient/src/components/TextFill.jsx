// src/components/TextFill.jsx

import React, { useState, useImperativeHandle, forwardRef } from "react";
import "./TextFill.css";

const TextFill = forwardRef(({ progress = 0 }, ref) => {
  const [fillProgress, setFillProgress] = useState(progress);

  // Expose a method to update the fill progress directly from the parent
  useImperativeHandle(ref, () => ({
    updateProgress: (value) => {
      // Avoid unnecessary re-renders if the value didn’t really change
      setFillProgress((prev) => (Math.abs(prev - value) > 0.1 ? value : prev));
    },
  }));

  const clampedProgress = Math.max(0, Math.min(100, fillProgress));

  // Constants for the SVG layout
  const VIEWBOX_HEIGHT = 180;
  const END_Y_POSITION = VIEWBOX_HEIGHT * 0.35; // final water surface level (≈63px)
  const TRAVEL_DISTANCE = VIEWBOX_HEIGHT - END_Y_POSITION; // 117px

  // Compute the vertical offset based on progress
  const waterYPosition =
    VIEWBOX_HEIGHT - TRAVEL_DISTANCE * (clampedProgress / 100);

  return (
    <div className="text-fill-container">
      <svg
        viewBox="0 0 800 180"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="textMask">
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="text-mask"
            >
              UniFloww
            </text>
          </clipPath>
        </defs>

        {/* Static background text */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="text-background"
        >
          UniFloww
        </text>

        {/* Animated water fill */}
        <g clipPath="url(#textMask)">
          <g
            style={{
              transform: `translateY(${waterYPosition}px)`,
              transition: "transform 1s linear", // smooth micro-motion
              willChange: "transform",
            }}
          >
            <rect className="water-body" x="-400" y="30" width="1600" height="150" />
            <path
              className="text-wave-wave-front"
              d="M -400 30 C -300 60 -200 0 0 30 S 200 60 400 30 S 600 0 800 30 S 1000 60 1200 30 V 180 H -400 Z"
            />
            <path
              className="text-wave-wave-back"
              d="M -800 30 C -700 60 -600 0 -400 30 S -200 60 0 30 S 200 0 400 30 S 600 60 800 30 V 180 H -800 Z"
            />
          </g>
        </g>
      </svg>
    </div>
  );
});

export default TextFill;
