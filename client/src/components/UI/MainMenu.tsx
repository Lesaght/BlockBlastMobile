import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { useAudio } from "@/lib/stores/useAudio";
import { Music, VolumeX, Volume2, Info, Trophy, Gamepad2 } from "lucide-react";
import AuthButton from "./AuthButton";

export default function MainMenu() {
  const gameState = useBlockGame((state) => state.gameState);
  const highScore = useBlockGame((state) => state.highScore);
  const startGame = useBlockGame((state) => state.startGame);
  const isMuted = useAudio((state) => state.isMuted);
  const toggleMute = useAudio((state) => state.toggleMute);

  const [showControls, setShowControls] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Если не меню, не отображаем компонент
  if (gameState !== "menu") {
    return null;
  }

  // Анимация для кнопок
  const buttonVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  // Лого и заголовок
  const titleVariants = {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-b from-blue-900 to-purple-900">
      <div className="w-full max-w-md px-4 py-8 flex flex-col items-center">
        {/* Заголовок игры */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={titleVariants}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-bold mb-2 text-white">
            Block <span className="text-yellow-400">Blast!</span>
          </h1>
          <p className="text-blue-200 text-lg">Соединяй блоки и набирай очки</p>
        </motion.div>

        {/* Высший счет */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex items-center bg-blue-800/30 px-4 py-2 rounded-lg"
        >
          <Trophy className="text-yellow-400 mr-2" size={20} />
          <span className="text-white">Рекорд: <span className="font-bold">{highScore}</span></span>
        </motion.div>

        {/* Кнопки меню */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
            onClick={startGame}
          >
            Начать Игру
          </motion.button>

          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
            onClick={() => setShowControls(true)}
          >
            <div className="flex items-center justify-center">
              <Gamepad2 className="mr-2" size={20} />
              Управление
            </div>
          </motion.button>

          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
            onClick={() => setShowInfo(true)}
          >
            <div className="flex items-center justify-center">
              <Info className="mr-2" size={20} />
              Об Игре
            </div>
          </motion.button>
        </div>

        {/* Кнопка авторизации */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex gap-4 items-center"
        >
          <AuthButton />
          <motion.button
            onClick={toggleMute}
            className="p-3 bg-blue-800/30 rounded-full"
          >
            {isMuted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
          </motion.button>
        </motion.div>

        {/* Модальное окно с управлением */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-60"
              onClick={() => setShowControls(false)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-gray-900 rounded-lg p-6 max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Управление</h3>
                <div className="space-y-3 text-gray-200">
                  <p className="flex items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded mr-2">←↑→↓</span>
                    Перемещение курсора
                  </p>
                  <p className="flex items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded mr-2">Пробел</span>
                    Выбрать блок
                  </p>
                  <p className="mt-4 text-sm text-gray-400">
                    Соединяйте 3 или более блоков одинакового цвета, чтобы убрать их и набрать очки.
                    Чем больше блоков в цепочке, тем больше очков!
                  </p>
                </div>
                <button 
                  className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  onClick={() => setShowControls(false)}
                >
                  Понятно
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Модальное окно об игре */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-60"
              onClick={() => setShowInfo(false)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-gray-900 rounded-lg p-6 max-w-sm mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Об Игре</h3>
                <div className="space-y-3 text-gray-200">
                  <p>
                    <span className="font-bold">Block Blast!</span> — увлекательная головоломка, 
                    где вам нужно собирать группы одинаковых блоков.
                  </p>
                  <p>
                    Ваша цель — набрать необходимое количество очков, чтобы пройти на следующий уровень. 
                    Каждый уровень становится сложнее предыдущего.
                  </p>
                  <p>
                    Если нет возможных ходов, игра автоматически перемешает блоки без потери хода!
                  </p>
                </div>
                <button 
                  className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  onClick={() => setShowInfo(false)}
                >
                  Закрыть
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Копирайт */}
        <div className="mt-8 text-blue-200 text-sm">
          © 2024 Block Blast Game
        </div>
      </div>
    </div>
  );
}