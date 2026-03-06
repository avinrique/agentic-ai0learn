'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
  color: string;
  children?: ReactNode;
  bgOpacity?: number;
}

export default function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  children,
  bgOpacity = 0.15,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          opacity={bgOpacity}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      {children}
    </div>
  );
}
