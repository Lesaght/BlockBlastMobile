import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Info, X } from "lucide-react";

export default function TouchControls() {
  // Хуки вызываются всегда, независимо от условий
  const isMobile = useIsMobile();
  const gameState = useBlockGame((state) => state.gameState);
  const [showHelp, setShowHelp] = useState(true);
  const [lastButtonClickTime, setLastButtonClickTime] = useState<Record<string, number>>({});

  // Создаем виртуальные события клавиатуры
  const triggerKeyEvent = useCallback((key: string, type: 'keydown' | 'keyup') => {
    const event = new KeyboardEvent(type, {
      key,
      code: key,
      keyCode: key === 'ArrowUp' ? 38 : key === 'ArrowDown' ? 40 : key === 'ArrowLeft' ? 37 : 39,
      which: key === 'ArrowUp' ? 38 : key === 'ArrowDown' ? 40 : key === 'ArrowLeft' ? 37 : 39,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }, []);

  // Обработчики нажатий для виртуальных кнопок
  const handleTouchStart = useCallback((key: string) => () => {
    triggerKeyEvent(key, 'keydown');
  }, [triggerKeyEvent]);

  const handleTouchEnd = useCallback((key: string) => () => {
    triggerKeyEvent(key, 'keyup');
  }, [triggerKeyEvent]);
  
  // Обработчик для быстрого нажатия на кнопку с защитой от дабл-клика
  const handleButtonClick = useCallback((keyName: string) => {
    const currentTime = new Date().getTime();
    const lastClick = lastButtonClickTime[keyName] || 0;
    
    // Защита от дабл-клика: игнорируем нажатия, происходящие слишком быстро (менее 300 мс)
    if (currentTime - lastClick < 300) {
      return;
    }
    
    // Обновить время последнего нажатия
    setLastButtonClickTime(prev => ({
      ...prev,
      [keyName]: currentTime
    }));
    
    // Специальная обработка для справки
    if (keyName === 'close-help') {
      setShowHelp(false);
      return;
    } else if (keyName === 'show-help') {
      setShowHelp(true);
      return;
    }
    
    // Отправить событие нажатия и отпускания клавиши для игровых кнопок
    triggerKeyEvent(keyName, 'keydown');
    setTimeout(() => {
      triggerKeyEvent(keyName, 'keyup');
    }, 100);
  }, [lastButtonClickTime, triggerKeyEvent]);
  
  // Обработчик для кнопки выбора
  const handleSelectClick = useCallback(() => handleButtonClick('Space'), [handleButtonClick]);

  // Если не мобильное устройство или не в режиме игры, ничего не рендерим
  const shouldRender = isMobile && gameState === "playing";
  
  // Рендерим инструкцию по управлению
  const helpContent = useMemo(() => {
    if (!showHelp) return null;
    
    return (
      <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 bg-opacity-90 text-white p-3 rounded-lg z-20 w-[90%] max-w-xs text-center">
        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={() => handleButtonClick('close-help')}
        >
          <X size={16} />
        </button>
        
        <h3 className="font-bold mb-2">Как играть</h3>
        <p className="text-sm mb-3">
          Используйте стрелки для перемещения курсора и кнопку SELECT для выбора блоков. 
          Собирайте 3 или более блоков одного цвета.
        </p>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          onClick={() => handleButtonClick('close-help')}
        >
          Понятно
        </button>
      </div>
    );
  }, [showHelp, handleButtonClick]);
  
  // Рендерим контроллы управления
  const controlsContent = useMemo(() => {
    return (
      <div className="fixed bottom-14 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2">
          {/* Верхняя кнопка */}
          <button
            className="w-12 h-12 bg-gray-800 bg-opacity-60 text-white rounded-full flex items-center justify-center active:bg-gray-700"
            onTouchStart={handleTouchStart('ArrowUp')}
            onTouchEnd={handleTouchEnd('ArrowUp')}
            aria-label="Up"
          >
            <ArrowUp size={20} />
          </button>
          
          {/* Средний ряд кнопок */}
          <div className="flex gap-2">
            <button
              className="w-12 h-12 bg-gray-800 bg-opacity-60 text-white rounded-full flex items-center justify-center active:bg-gray-700"
              onTouchStart={handleTouchStart('ArrowLeft')}
              onTouchEnd={handleTouchEnd('ArrowLeft')}
              aria-label="Left"
            >
              <ArrowLeft size={20} />
            </button>
            
            <button
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center active:bg-blue-700"
              onClick={handleSelectClick}
              aria-label="Select"
            >
              <span className="text-xs font-bold">SELECT</span>
            </button>
            
            <button
              className="w-12 h-12 bg-gray-800 bg-opacity-60 text-white rounded-full flex items-center justify-center active:bg-gray-700"
              onTouchStart={handleTouchStart('ArrowRight')}
              onTouchEnd={handleTouchEnd('ArrowRight')}
              aria-label="Right"
            >
              <ArrowRight size={20} />
            </button>
          </div>
          
          {/* Нижняя кнопка */}
          <button
            className="w-12 h-12 bg-gray-800 bg-opacity-60 text-white rounded-full flex items-center justify-center active:bg-gray-700"
            onTouchStart={handleTouchStart('ArrowDown')}
            onTouchEnd={handleTouchEnd('ArrowDown')}
            aria-label="Down"
          >
            <ArrowDown size={20} />
          </button>
        </div>
        
        {/* Кнопка показа справки */}
        <button
          className="absolute -right-16 bottom-8 w-8 h-8 bg-gray-800 bg-opacity-60 text-white rounded-full flex items-center justify-center"
          onClick={() => handleButtonClick('show-help')}
          aria-label="Help"
        >
          <Info size={14} />
        </button>
      </div>
    );
  }, [handleTouchStart, handleTouchEnd, handleSelectClick, handleButtonClick]);

  // Если не мобильное устройство или не в режиме игры, ничего не рендерим
  if (!shouldRender) {
    return null;
  }

  return (
    <>
      {helpContent}
      {controlsContent}
    </>
  );
}