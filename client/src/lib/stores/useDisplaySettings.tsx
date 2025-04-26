import { create } from 'zustand';

interface DisplaySettingsState {
  // Настройки отображения
  showAnimations: boolean;  // Показывать анимации при совпадении блоков
  showHints: boolean;       // Показывать подсказки возможных ходов
  
  // Методы
  toggleAnimations: () => void;
  toggleHints: () => void;
  initFromLocalStorage: () => void;
}

export const useDisplaySettings = create<DisplaySettingsState>((set, get) => ({
  // Значения по умолчанию
  showAnimations: true,
  showHints: false,
  
  // Переключить отображение анимаций
  toggleAnimations: () => {
    const newValue = !get().showAnimations;
    // Сохраняем в localStorage
    localStorage.setItem('blockgame_showAnimations', JSON.stringify(newValue));
    set({ showAnimations: newValue });
  },
  
  // Переключить отображение подсказок
  toggleHints: () => {
    const newValue = !get().showHints;
    // Сохраняем в localStorage
    localStorage.setItem('blockgame_showHints', JSON.stringify(newValue));
    set({ showHints: newValue });
  },
  
  // Загрузка настроек из localStorage при инициализации
  initFromLocalStorage: () => {
    try {
      // Загружаем настройки анимаций
      const storedAnimations = localStorage.getItem('blockgame_showAnimations');
      const storedHints = localStorage.getItem('blockgame_showHints');
      
      // Всегда принудительно отключаем подсказки при запуске
      // Явно устанавливаем в localStorage
      localStorage.setItem('blockgame_showHints', 'false');
      
      // Устанавливаем сохранённые значения или значения по умолчанию
      set({
        showAnimations: storedAnimations ? JSON.parse(storedAnimations) : true,
        showHints: false // Всегда false по умолчанию, игнорируем сохраненное значение
      });
      
      console.log('Настройки отображения загружены из localStorage, подсказки отключены');
    } catch (error) {
      console.error('Ошибка при загрузке настроек отображения:', error);
    }
  }
}));