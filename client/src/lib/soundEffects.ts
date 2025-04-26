// Helper functions for working with sound effects

// Play a sound effect with potential fallback for failed plays
export const playSound = (audioElement: HTMLAudioElement | null, options?: { 
  volume?: number; 
  loop?: boolean;
  playbackRate?: number;
}) => {
  if (!audioElement) return;

  if (options?.volume !== undefined) {
    audioElement.volume = options.volume;
  }

  if (options?.loop !== undefined) {
    audioElement.loop = options.loop;
  }

  if (options?.playbackRate !== undefined) {
    audioElement.playbackRate = options.playbackRate;
  }

  // Reset sound position if already playing
  audioElement.currentTime = 0;

  // Attempt to play and handle potential browser blocking
  audioElement.play().catch(error => {
    console.log(`Sound play failed: ${error.message}`);
  });
};

// Stop a playing sound
export const stopSound = (audioElement: HTMLAudioElement | null) => {
  if (!audioElement) return;

  audioElement.pause();
  audioElement.currentTime = 0;
};

// Fade out a sound over time (in milliseconds)
export const fadeOutSound = (audioElement: HTMLAudioElement | null, duration: number = 500) => {
  if (!audioElement) return;

  const originalVolume = audioElement.volume;
  const fadeSteps = 20;
  const volumeStep = originalVolume / fadeSteps;
  const intervalTime = duration / fadeSteps;

  const fadeInterval = setInterval(() => {
    if (audioElement.volume > volumeStep) {
      audioElement.volume -= volumeStep;
    } else {
      audioElement.pause();
      audioElement.volume = originalVolume;
      clearInterval(fadeInterval);
    }
  }, intervalTime);
};

// Preload sounds to improve performance
export const preloadSounds = () => {
  const sounds = [
    '/sounds/background.mp3',
    '/sounds/hit.mp3',
    '/sounds/success.mp3'
  ];

  sounds.forEach(src => {
    const audio = new Audio(src);
    audio.load();
  });
};

import { useAudio } from './stores/useAudio';

export const playAchievementSound = () => {
  const audio = new Audio('/sounds/success.mp3');
  audio.volume = 0.5;

  const { isMuted } = useAudio.getState();
  if (!isMuted) {
    audio.play().catch((error) => {
      if (error.name !== 'NotAllowedError') {
        console.error('Sound playback error:', error);
      }
    });
  }
};

let hitAudio: HTMLAudioElement;
let successAudio: HTMLAudioElement;

export const initSounds = () => {
  hitAudio = new Audio('/sounds/hit.mp3');
  hitAudio.volume = 0.3;
  successAudio = new Audio('/sounds/success.mp3');
  successAudio.volume = 0.5;
};

export const playHitSound = () => {
  const { isMuted } = useAudio.getState();
  if (!isMuted && hitAudio) {
    hitAudio.currentTime = 0;
    hitAudio.play().catch((error) => {
      if (error.name !== 'NotAllowedError') {
        console.error('Sound playback error:', error);
      }
    });
  }
};