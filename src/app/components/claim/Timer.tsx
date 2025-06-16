'use client';

import { useState, useEffect } from 'react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Timer() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isFlickering, setIsFlickering] = useState(false);

  // Target: June 20, 2025 3:20 PM CST
  const targetDate = new Date('2025-06-20T15:20:00-06:00'); // CST is UTC-6

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });

        // Trigger flicker effect
        setIsFlickering(true);
        setTimeout(() => setIsFlickering(false), 100);
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div className={`glass-card-small p-6 lg:p-8 neon-border relative overflow-hidden group/timer transition-all duration-100 ${
      isFlickering ? 'opacity-80 brightness-125' : 'opacity-100'
    }`}>
      <div className="relative z-10">
        <div className="text-center mb-4">
          <span className="text-foreground/60 text-lg font-mono uppercase tracking-wider">
            Degen Launch In
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-center">
          {/* Days */}
          <div className={`glass-card-small p-3 transition-all duration-100 ${
            isFlickering ? 'bg-purple-500/20 border-purple-400/50' : 'bg-glass/20'
          }`}>
            <div className={`text-2xl lg:text-3xl font-bold gradient-text font-mono transition-all duration-100 ${
              isFlickering ? 'text-shadow-glow' : ''
            }`}>
              {formatNumber(timeRemaining.days)}
            </div>
            <div className="text-xs lg:text-sm text-foreground/60 uppercase tracking-wider mt-1">
              Days
            </div>
          </div>

          {/* Hours */}
          <div className={`glass-card-small p-3 transition-all duration-100 ${
            isFlickering ? 'bg-teal-500/20 border-teal-400/50' : 'bg-glass/20'
          }`}>
            <div className={`text-2xl lg:text-3xl font-bold gradient-text font-mono transition-all duration-100 ${
              isFlickering ? 'text-shadow-glow' : ''
            }`}>
              {formatNumber(timeRemaining.hours)}
            </div>
            <div className="text-xs lg:text-sm text-foreground/60 uppercase tracking-wider mt-1">
              Hours
            </div>
          </div>

          {/* Minutes */}
          <div className={`glass-card-small p-3 transition-all duration-100 ${
            isFlickering ? 'bg-purple-500/20 border-purple-400/50' : 'bg-glass/20'
          }`}>
            <div className={`text-2xl lg:text-3xl font-bold gradient-text font-mono transition-all duration-100 ${
              isFlickering ? 'text-shadow-glow' : ''
            }`}>
              {formatNumber(timeRemaining.minutes)}
            </div>
            <div className="text-xs lg:text-sm text-foreground/60 uppercase tracking-wider mt-1">
              Min
            </div>
          </div>

          {/* Seconds */}
          <div className={`glass-card-small p-3 transition-all duration-100 ${
            isFlickering ? 'bg-teal-500/20 border-teal-400/50' : 'bg-glass/20'
          }`}>
            <div className={`text-2xl lg:text-3xl font-bold gradient-text font-mono transition-all duration-100 ${
              isFlickering ? 'text-shadow-glow' : ''
            }`}>
              {formatNumber(timeRemaining.seconds)}
            </div>
            <div className="text-xs lg:text-sm text-foreground/60 uppercase tracking-wider mt-1">
              Sec
            </div>
          </div>
        </div>

        {/* Target date display */}
        <div className="text-center mt-4">
          <div className="text-xs text-foreground/40 font-mono uppercase tracking-wider">
            June 20, 2025 • 3:20 PM CST
          </div>
        </div>
      </div>

      {/* Animated background that flickers */}
      <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/5 to-teal-500/5 transition-opacity duration-100 ${
        isFlickering ? 'opacity-30' : 'opacity-0'
      } group-hover/timer:opacity-100`}></div>
      
      {/* Additional glow effect on flicker */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-purple-600 to-teal-600 rounded-xl blur transition-opacity duration-100 ${
        isFlickering ? 'opacity-20' : 'opacity-0'
      } pointer-events-none`}></div>
    </div>
  );
}
