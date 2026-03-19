// App.jsx
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

// --- Application Data ---
const applications = [
  {
    university: "Harvard University",
    milestones: ["Submitted", "Review", "Interview", "Decision", "Outcome"],
    completed: 2,
  },
  {
    university: "Stanford University",
    milestones: ["Submitted", "Review", "Interview", "Decision", "Outcome"],
    completed: 3,
  },
  {
    university: "MIT",
    milestones: ["Submitted", "Review", "Interview", "Decision", "Outcome"],
    completed: 1,
  },
  {
    university: "Oxford University",
    milestones: ["Submitted", "Review", "Interview", "Decision", "Outcome"],
    completed: 5,
  },
];

// --- SVG Timeline Component ---
const SvgLiquidTimeline = ({ application }) => {
  if (!application) return null;
  const { milestones, completed } = application;
  const controls = useAnimation();

  // --- Layout ---
  const chamberHeight = 80;
  const chamberWidth = 80;
  const pipeHeight = 20; // smaller pipe height
  const pipeWidth = 120;
  const yCenter = 75;
  const totalTimelineWidth =
    milestones.length * chamberWidth + (milestones.length - 1) * pipeWidth;

  // --- Chamber + Pipe Positions ---
  const chamberPositions = milestones.map((_, index) => {
    const x = index * (chamberWidth + pipeWidth);
    const y = yCenter - chamberHeight / 2;
    return { x, y, width: chamberWidth, height: chamberHeight, centerX: x + chamberWidth / 2 };
  });

  const pipePositions = milestones.slice(0, -1).map((_, index) => {
    const x = chamberPositions[index].x + chamberWidth;
    const y = yCenter - pipeHeight / 2; // vertically centered
    return { x, y, width: pipeWidth, height: pipeHeight };
  });

  // --- Animation ---
  useEffect(() => {
    const targetMilestoneIndex = Math.min(completed, milestones.length);
    let targetWidth = 0;
    if (targetMilestoneIndex > 0) {
      const lastChamberX = chamberPositions[targetMilestoneIndex - 1].x;
      targetWidth = lastChamberX + chamberWidth;
    }

    controls.start({
      width: targetWidth,
      transition: { duration: 2, ease: "easeOut" },
    });
  }, [completed, controls, chamberPositions]);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
    >
      <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center sm:text-left">
        {application.university}
      </h2>

      <svg width="100%" height="180" viewBox={`-10 0 ${totalTimelineWidth + 20} 180`}>
        <defs>
          <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#42a5f5" />
          </linearGradient>

          {/* ClipPath for connected liquid */}
          <clipPath id="timelineClip">
            {/* Chambers */}
            {chamberPositions.map((pos, i) => (
              <rect
                key={`clip-chamber-${i}`}
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
                rx="30"
                ry="30"
              />
            ))}
            {/* Pipes (smaller, center-aligned) */}
            {pipePositions.map((pos, i) => (
              <rect
                key={`clip-pipe-${i}`}
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
                rx="0"
                ry="0"
              />
            ))}
          </clipPath>
        </defs>

        {/* Liquid */}
        <motion.rect
          x="0"
          y={yCenter - chamberHeight / 2}
          height={chamberHeight}
          fill="url(#liquidGradient)"
          initial={{ width: 0 }}
          animate={controls}
          clipPath="url(#timelineClip)"
        />

        {/* Milestone Labels */}
        {chamberPositions.map((pos, index) => (
          <text
            key={`label-${index}`}
            x={pos.centerX}
            y={yCenter + 70}
            textAnchor="middle"
            fontWeight="bold"
            fill="#334155"
          >
            {milestones[index]}
          </text>
        ))}
      </svg>
    </motion.div>
  );
};

// --- Dashboard ---
const ApplicationDashboard = ({ applications }) => (
  <motion.div
    className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 w-full max-w-6xl space-y-12"
    initial="hidden"
    animate="visible"
    variants={{ visible: { transition: { staggerChildren: 0.25 } } }}
  >
    {applications.map((app) => (
      <SvgLiquidTimeline key={app.university} application={app} />
    ))}
  </motion.div>
);

// --- App Entry ---
function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <ApplicationDashboard applications={applications} />
    </div>
  );
}

export default App;
