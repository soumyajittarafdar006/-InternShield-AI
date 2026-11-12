import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';

export default function RiskGauge({ score = 0, riskLevel = "Low Risk", size = 220 }) {
  // Clamped score
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  
  // Radius and circumference
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle or 270-degree arc
  // We'll use 270 degrees (3/4 of a circle)
  const arcPercentage = 0.75;
  const arcLength = circumference * arcPercentage;
  const strokeDashoffset = arcLength - (arcLength * (safeScore / 100));

  // Colors based on risk
  let color = "#10B981"; // Green
  let glowColor = "rgba(16, 185, 129, 0.4)";
  let badgeBg = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  let Icon = ShieldCheck;

  if (safeScore > 60) {
    color = "#EF4444"; // Red
    glowColor = "rgba(239, 68, 68, 0.45)";
    badgeBg = "bg-red-500/15 text-red-400 border-red-500/30";
    Icon = ShieldAlert;
  } else if (safeScore > 30) {
    color = "#F59E0B"; // Amber
    glowColor = "rgba(245, 158, 11, 0.4)";
    badgeBg = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    Icon = AlertTriangle;
  }

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size }}>
        
        {/* Ambient Glow behind gauge */}
        <div 
          className="absolute inset-4 rounded-full filter blur-xl opacity-30 transition-all duration-700 pointer-events-none"
          style={{ background: color }}
        />

        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-135 drop-shadow-md"
        >
          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Animated Value Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-extrabold tracking-tight font-sans text-white">
                {safeScore}
              </span>
              <span className="text-lg font-semibold text-slate-400 ml-1">/100</span>
            </div>

            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-1">
              Risk Score
            </span>

            <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{riskLevel}</span>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Risk Range Explanation Bar */}
      <div className="w-full max-w-xs mt-3 flex items-center justify-between text-[11px] font-medium text-slate-400 px-2">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>0–30: Low</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>31–60: Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>61–100: High</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 text-center mt-1.5">
        *Heuristic risk bands based on linguistic signals & ML confidence.
      </p>
    </div>
  );
}
