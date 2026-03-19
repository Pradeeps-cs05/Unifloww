// src/components/WaterBall.jsx

import React from 'react';
import './WaterBall.css';

const WaterBall = ({ progress = 0, size = 150 }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const waterYPosition = 200 * (1 - clampedProgress / 100);

  const ballStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div className="water-ball-container" style={ballStyle}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="outerCircleClip">
            <circle cx="100" cy="100" r="100" />
          </clipPath>

          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#42a5f5" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* This group applies the circular clip path to EVERYTHING inside it. */}
        <g clipPath="url(#outerCircleClip)">

          {/* --- THE GREY BACKGROUND RECTANGLE HAS BEEN REMOVED FROM HERE --- */}

          {/* This group contains all the water elements. It moves up and down. */}
          <g style={{ transform: `translateY(${waterYPosition}px)` }}>
            {/* Main water body - a simple rectangle */}
            <rect
              x="0"
              y="0"
              width="200"
              height="200"
              fill="url(#waterGradient)"
            />

            {/* Wave Layer 1 (front) - a highlight */}
            <path
              className="wave"
              fill="rgba(255, 255, 255, 0.2)"
              d="M -200 20 C -150 40 -100 0 0 20 S 100 40 200 20 S 300 0 400 20 V 200 H -200 Z"
            />

            {/* Wave Layer 2 (back) - a shadow */}
            <path
              className="wave wave-back"
              fill="rgba(0, 0, 0, 0.1)"
              d="M -200 20 C -150 0 -100 40 0 20 S 100 0 200 20 S 300 40 400 20 V 200 H -200 Z"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default WaterBall;