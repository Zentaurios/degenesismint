import React, { useState, useEffect, useCallback, RefObject, useImperativeHandle, forwardRef } from 'react';
import { CircleDollarSign, Rocket } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  scale: number;
  opacity: number;
  isRocket: boolean;
  created: number;
  lifetime: number;
}

interface CoinAnimationProps {
  parentRef: RefObject<HTMLDivElement | null>;
}

export interface CoinAnimationRef {
  startCelebration: () => void;
}

const CoinAnimation = forwardRef<CoinAnimationRef, CoinAnimationProps>(({ parentRef }, ref) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);

  const createParticle = useCallback((isRocket = false) => {
    const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
    // Increased base speed for coins
    const speed = isRocket ? 8 : 8 + Math.random() * 6;
    const lifetime = isRocket ? 1500 : 1500; // Longer lifetime for coins
    
    return {
      id: Math.random(),
      x: 0,
      y: -12,  // Spawning 12px higher
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed * 1.2, // Extra upward boost for coins
      rotation: Math.random() * 360,
      scale: isRocket ? 2.25 : 1.2 + Math.random() * 0.6, // 50% bigger
      opacity: 1,
      isRocket,
      created: Date.now(),
      lifetime,
    };
  }, []);

  const explodeRocket = useCallback((rocket: Particle) => {
    const numCoins = 24; // More particles
    const newParticles: Particle[] = [];
    
    // Create explosion ring
    for (let i = 0; i < numCoins; i++) {
      const angle = (i * 360 / numCoins) * (Math.PI / 140);
      const speed = 5 + Math.random() * 4; // Faster initial speed
      const variance = Math.random() * 0.8; // More variance
      
      newParticles.push({
        id: Math.random(),
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed * (1 + variance),
        vy: Math.sin(angle) * speed * (1 + variance) - 2, // Initial upward boost
        rotation: Math.random() * 360,
        scale: 0.45 + Math.random() * 0.45, // 50% bigger explosion coins
        opacity: 1,
        isRocket: false,
        created: Date.now(),
        lifetime: 1000 + Math.random() * 500, // Longer lifetime
      });
    }

    // Add central burst
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 8; // More varied speeds
      
      newParticles.push({
        id: Math.random(),
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3, // Stronger upward boost
        rotation: Math.random() * 360,
        scale: 0.3 + Math.random() * 0.6, // 50% bigger burst coins
        opacity: 1,
        isRocket: false,
        created: Date.now(),
        lifetime: 800 + Math.random() * 600,
      });
    }
    
    setParticles(prev => [...prev.filter(p => p.id !== rocket.id), ...newParticles]);
  }, []);

  const spawnCoins = useCallback(() => {
    const isRocketSpawn = Math.random() < 0.3; // Increased rocket chance for celebration
    const numParticles = isRocketSpawn ? 1 : 5 + Math.floor(Math.random() * 5); // More coins
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < numParticles; i++) {
      newParticles.push(createParticle(isRocketSpawn));
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  }, [createParticle]);

  const startCelebration = useCallback(() => {
    setParticles([]); // Clear existing particles
    
    // Immediate burst
    spawnCoins();
    
    // Set up interval for continuous spawning
    const spawnInterval = setInterval(() => {
      spawnCoins();
    }, 200); // Spawn every 200ms for dense celebration
    
    // Stop after 7.77 seconds
    setTimeout(() => {
      clearInterval(spawnInterval);
    }, 7770);
  }, [spawnCoins]);

  useImperativeHandle(ref, () => ({
    startCelebration
  }), [startCelebration]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let animationFrame: number;
    const updateParticles = () => {
      setParticles(prevParticles => {
        const now = Date.now();
        return prevParticles
          .map(particle => {
            const age = now - particle.created;
            const lifeProgress = age / particle.lifetime;
            
            if (lifeProgress >= 1) return null;
            
            // Reduced gravity and drag for coins
            const gravity = particle.isRocket ? 0.1 : 0.08;
            const drag = particle.isRocket ? 0.99 : 0.995; // Less drag on coins
            
            return {
              ...particle,
              x: particle.x + particle.vx,
              y: particle.y + particle.vy,
              vx: particle.vx * drag,
              vy: particle.vy * drag + gravity,
              opacity: particle.isRocket ? 
                1 : 
                Math.max(0, 1 - (lifeProgress * 1.2)), // Slower fade for coins
              rotation: particle.rotation + (particle.isRocket ? 2 : 8),
            };
          })
          .filter((particle): particle is Particle => {
            if (!particle) return false;
            // Trigger explosion when rocket starts falling
            if (particle.isRocket && particle.vy > 2) {
              explodeRocket(particle);
              return false;
            }
            return true;
          });
      });
      
      animationFrame = requestAnimationFrame(updateParticles);
    };
    
    animationFrame = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrame);
  }, [isClient, explodeRocket]);

  if (!isClient || !parentRef.current) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-50 bg-black bg-opacity-20"
      aria-hidden="true"
    >
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed left-1/2 top-3/4 "
          style={{
            transform: `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg) scale(${particle.scale})`,
            opacity: particle.opacity,
          }}
        >
          {particle.isRocket ? (
            <Rocket className="text-Blue" size={32} />
          ) : (
            <CircleDollarSign className="text-green-400" size={28} />
          )}
        </div>
      ))}
    </div>
  );
});

CoinAnimation.displayName = 'CoinAnimation';

export default CoinAnimation;
