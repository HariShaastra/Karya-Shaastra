import React from 'react';
import { motion } from 'motion/react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-brand-primary)" />
          <stop offset="100%" stopColor="var(--color-brand-accent)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Abstract Growth Shape - Organic "K" */}
      <motion.path
        d="M30 20C30 20 25 50 30 80"
        stroke="url(#logo-grad)"
        strokeWidth="10"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      <motion.path
        d="M30 50C45 40 65 25 75 25"
        stroke="url(#logo-grad)"
        strokeWidth="10"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
      />

      <motion.path
        d="M30 50C50 60 70 75 75 80"
        stroke="url(#logo-grad)"
        strokeWidth="10"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }}
      />

      {/* Impact Sparkle */}
      <motion.circle 
        cx="75" 
        cy="25" 
        r="6" 
        fill="var(--color-brand-accent)"
        filter="url(#glow)"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Nodes */}
      <circle cx="30" cy="20" r="3" fill="var(--color-brand-ink)" opacity="0.2" />
      <circle cx="30" cy="80" r="3" fill="var(--color-brand-ink)" opacity="0.2" />
      <circle cx="75" cy="80" r="3" fill="var(--color-brand-ink)" opacity="0.2" />
    </svg>
  );
}
