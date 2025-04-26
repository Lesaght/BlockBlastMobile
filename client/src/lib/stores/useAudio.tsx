import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  
  // Инициализация из localStorage
  initFromLocalStorage: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: true, // По умолчанию выключен звук
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Обновляем состояние
    set({ isMuted: newMutedState });
    
    // Сохраняем в localStorage
    localStorage.setItem('blockBlast_isMuted', String(newMutedState));
    
    // Логируем изменение
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  initFromLocalStorage: () => {
    try {
      const storedMuted = localStorage.getItem('blockBlast_isMuted');
      const isMuted = storedMuted ? storedMuted === 'true' : true;
      set({ isMuted });
    } catch (error) {
      console.error('Ошибка при загрузке аудио настроек:', error);
    }
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // Если звук выключен, не проигрываем
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Клонируем звук для возможности одновременного воспроизведения
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // Если звук выключен, не проигрываем
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  }
}));
