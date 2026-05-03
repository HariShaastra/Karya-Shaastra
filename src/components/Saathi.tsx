import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export type SaathiEmotion = 'happy' | 'thinking' | 'encouraging' | 'neutral' | 'sad' | 'excited';

interface SaathiProps {
  emotion?: SaathiEmotion;
  message?: string;
  className?: string;
}

export default function Saathi({ emotion = 'neutral', message, className = "" }: SaathiProps) {
  const getCoreColor = () => {
    switch (emotion) {
      case 'happy': return 'bg-green-500';
      case 'excited': return 'bg-orange-500';
      case 'thinking': return 'bg-blue-500';
      case 'sad': return 'bg-gray-400';
      default: return 'bg-brand-primary';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <motion.div 
        className={`relative w-24 h-24 flex items-center justify-center`}
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Outer Orbit */}
        <motion.div 
          className="absolute inset-0 border border-brand-line/5 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Professional Minimalist Mascot: The Core */}
        <div className="relative w-12 h-12">
          {/* Main Geometric Core */}
          <motion.div 
            className={cn(
              "w-full h-full rounded-xl shadow-2xl opacity-80 backdrop-blur-sm",
              getCoreColor()
            )}
            animate={{ 
              rotate: [45, 135, 225, 315, 45],
              borderRadius: emotion === 'thinking' ? ["20%", "50%", "20%"] : ["30%", "20%", "30%"]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />

          {/* Pulse Indicator */}
          <motion.div 
            className={cn("absolute inset-0 rounded-xl", getCoreColor())}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Eyes (Professional Indicators) */}
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <motion.div 
              className="w-1 h-1 bg-white rounded-full"
              animate={{ 
                scaleY: emotion === 'thinking' ? [1, 0.1, 1] : 1,
              }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
            <motion.div 
              className="w-1 h-1 bg-white rounded-full"
              animate={{ 
                scaleY: emotion === 'thinking' ? [1, 0.1, 1] : 1,
              }}
              transition={{ repeat: Infinity, duration: 4, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Orbiting Satellite */}
        <motion.div 
          className="absolute w-2 h-2 rounded-full bg-brand-primary/20 top-0 left-1/2 -translate-x-1/2"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 0.8, 1]
          }}
          style={{ originY: '48px' }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-brand-line/10 max-w-[180px] sm:max-w-[240px] shadow-xl"
        >
          <p className="text-[11px] font-bold text-brand-ink/80 text-center leading-relaxed serif italic tracking-wide">
            {message}
          </p>
        </motion.div>
      )}
    </div>
  );
}
