import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBlockGame } from "@/lib/stores/useBlockGame";

export default function GameMessage() {
  const message = useBlockGame((state) => state.message);
  const gameState = useBlockGame((state) => state.gameState);
  const clearMessage = useBlockGame((state) => state.clearMessage);
  const [isVisible, setIsVisible] = useState(false);
  
  // Управляем видимостью сообщения
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (message) {
      setIsVisible(true);
      // Auto-hide messages after 3 seconds
      timeout = setTimeout(() => {
        setIsVisible(false);
        clearMessage();
      }, 3000);
    } else {
      setIsVisible(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [message, clearMessage]);
  
  // Очищаем сообщение при ручном закрытии
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      clearMessage();
    }, 300); // Даем время для анимации закрытия
  };
  
  // Если нет сообщения, не рендерим ничего
  if (!message) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gray-900 bg-opacity-90 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm text-center">
            <p className="font-medium">{message}</p>
            
            {/* Отображаем индикатор загрузки при перемешивании */}
            {gameState === "shuffling" && (
              <div className="mt-2 flex justify-center">
                <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Кнопка закрытия, если это не статус перемешивания */}
            {gameState !== "shuffling" && (
              <button
                onClick={handleClose}
                className="mt-2 bg-blue-600 text-white px-4 py-1 text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Ок
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}