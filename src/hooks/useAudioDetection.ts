import { useState, useEffect } from 'react';

export const useAudioDetection = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let animationFrame: number;

    const checkHTMLAudioElements = () => {
      const audioElements = document.querySelectorAll('audio, video');
      let hasPlayingAudio = false;
      
      audioElements.forEach((element) => {
        const mediaElement = element as HTMLAudioElement | HTMLVideoElement;
        if (!mediaElement.paused && !mediaElement.muted && mediaElement.volume > 0) {
          hasPlayingAudio = true;
        }
      });
      
      setIsAudioPlaying(hasPlayingAudio);
      animationFrame = requestAnimationFrame(checkHTMLAudioElements);
    };
    
    // Start checking for audio
    checkHTMLAudioElements();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return isAudioPlaying;
};
