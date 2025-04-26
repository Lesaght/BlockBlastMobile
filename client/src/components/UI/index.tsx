import React from "react";
import ScoreDisplay from "./ScoreDisplay";
import LevelIndicator from "./LevelIndicator";
import GameMenu from "./GameMenu";
import TouchControls from "./TouchControls";
import GameMessage from "./GameMessage";
import MainMenu from "./MainMenu";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { RotateCw } from "lucide-react";
import AuthButton from "./AuthButton";
import Auth from "./Auth";



export default function UI() {
  const gameState = useBlockGame((state) => state.gameState);
  const restartGame = useBlockGame((state) => state.restartGame);

  // Отображаем главное меню, если находимся в состоянии меню
  if (gameState === "menu") {
    return <MainMenu />;
  }

  return (
    <div className="ui-layer">
      {/* Игровое сообщение (для уведомлений и перемешивания) */}
      <GameMessage />

      {/* Auth component added here */}
      <Auth />

      {/* Верхняя панель */}
      <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
        <ScoreDisplay />
        <LevelIndicator />
      </div>

      {/* Кнопки управления игрой (верхний правый угол) */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <button
          className="w-10 h-10 bg-gray-800 bg-opacity-70 text-white rounded-full flex items-center justify-center"
          onClick={restartGame}
          aria-label="Начать заново"
        >
          <RotateCw size={18} />
        </button>
        <AuthButton />
      </div>

      {/* Игровое меню на паузе и завершении игры */}
      {(gameState === "paused" || gameState === "game_over") && <GameMenu />}

      {/* Элементы управления для мобильных устройств */}
      <TouchControls />
    </div>
  );
}