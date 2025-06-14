import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetTimestamp: bigint;
}

export function CountdownTimer({ targetTimestamp }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [glitch, setGlitch] = useState(false);
  const [lastMinute, setLastMinute] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const target = Number(targetTimestamp);
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (60 * 60 * 24)),
        hours: Math.floor((difference / (60 * 60)) % 24),
        minutes: Math.floor((difference / 60) % 60),
        seconds: Math.floor(difference % 60),
      };
    };

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Trigger glitch effect on second change
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);

      // Double glitch on minute change
      if (newTimeLeft.minutes !== lastMinute) {
        setLastMinute(newTimeLeft.minutes);
        setTimeout(() => {
          setGlitch(true);
          setTimeout(() => setGlitch(false), 200);
        }, 150);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTimestamp, lastMinute]);

  if (isExpired) {
    return null;
  }

  return (
    <div className="relative">
      <div className={`text-4xl lg:text-6xl font-mono font-bold tracking-wider transition-all duration-100 ${
        glitch ? 'animate-glitch' : ''
      }`}>
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="gradient-text">{timeLeft.days.toString().padStart(2, '0')}</div>
            <div className="text-sm text-foreground/60 uppercase tracking-wider">days</div>
          </div>
          <div className="text-foreground/40">:</div>
          <div className="text-center">
            <div className="gradient-text">{timeLeft.hours.toString().padStart(2, '0')}</div>
            <div className="text-sm text-foreground/60 uppercase tracking-wider">hours</div>
          </div>
          <div className="text-foreground/40">:</div>
          <div className="text-center">
            <div className="gradient-text">{timeLeft.minutes.toString().padStart(2, '0')}</div>
            <div className="text-sm text-foreground/60 uppercase tracking-wider">mins</div>
          </div>
          <div className="text-foreground/40">:</div>
          <div className="text-center">
            <div className="gradient-text">{timeLeft.seconds.toString().padStart(2, '0')}</div>
            <div className="text-sm text-foreground/60 uppercase tracking-wider">secs</div>
          </div>
        </div>
      </div>
      {/* Glitch overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 to-teal-500/20 mix-blend-overlay pointer-events-none ${
        glitch ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-100`} />
    </div>
  );
} 