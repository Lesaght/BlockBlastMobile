
import { create } from "zustand";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface AchievementsState {
  achievements: Achievement[];
  unlockedAchievements: Set<string>;
  unlockAchievement: (id: string) => void;
}

export const achievements: Achievement[] = [
  {
    id: "quick_thinker",
    name: "Быстрый ум",
    description: "Собрать комбинацию за 3 секунды",
    icon: "⚡",
    unlocked: false
  },
  {
    id: "chain_master",
    name: "Мастер цепочек",
    description: "Собрать цепочку из 6+ блоков",
    icon: "🔗",
    unlocked: false
  },
  {
    id: "high_scorer",
    name: "Рекордсмен",
    description: "Набрать 10000 очков",
    icon: "🏆",
    unlocked: false
  }
];

export const useAchievements = create<AchievementsState>((set) => ({
  achievements: achievements,
  unlockedAchievements: new Set<string>(),
  unlockAchievement: (id: string) => {
    set((state) => {
      const newUnlocked = new Set(state.unlockedAchievements);
      newUnlocked.add(id);
      return { unlockedAchievements: newUnlocked };
    });
  }
}));
