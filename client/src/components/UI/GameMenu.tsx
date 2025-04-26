import { useState, useEffect } from "react";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { useAudio } from "@/lib/stores/useAudio";
import { VolumeX, Volume2, RefreshCw, HomeIcon, UserPlus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import AuthModal from "./auth/AuthModal";

export default function GameMenu() {
  const { 
    gameState, 
    startGame, 
    restartGame, 
    pauseGame, 
    resumeGame, 
    score,
    level,
    highScore,
    timeLeft,
    isAuthenticated
  } = useBlockGame();
  
  const [showMenu, setShowMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const toggleMute = useAudio((state) => state.toggleMute);
  const isMuted = useAudio((state) => state.isMuted);
  const isMobile = useIsMobile();

  // Show menu when game is paused or ended
  useEffect(() => {
    if (gameState === "paused" || gameState === "game_over") {
      setShowMenu(true);
    } else {
      setShowMenu(false);
    }
  }, [gameState]);

  const handlePlayClick = () => {
    if (gameState === "ready" || gameState === "game_over") {
      startGame();
    } else if (gameState === "paused") {
      resumeGame();
    }
    setShowMenu(false);
  };

  const handleRestartClick = () => {
    restartGame();
    setShowMenu(false);
  };

  const handlePauseClick = () => {
    if (gameState === "playing") {
      pauseGame();
      setShowMenu(true);
    } else {
      resumeGame();
      setShowMenu(false);
    }
  };

  const handleToggleMute = () => {
    toggleMute();
  };
  
  // Обработчик для возврата в главное меню
  const handleMainMenuClick = () => {
    // Принудительное обновление страницы для сброса состояния
    // (в реальном приложении можно было бы сделать более элегантно)
    window.location.reload();
  };

  return (
    <>
      {/* Floating controls during gameplay */}
      <div className={`fixed ${isMobile ? 'bottom-2 right-2' : 'bottom-4 right-4'} z-10 flex gap-2`}>
        <button 
          onClick={handleToggleMute}
          className={`${isMobile ? 'w-9 h-9' : 'w-10 h-10'} flex items-center justify-center bg-gray-800 bg-opacity-70 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={isMobile ? 16 : 18} /> : <Volume2 size={isMobile ? 16 : 18} />}
        </button>
        
        {gameState === "playing" && (
          <button
            onClick={handlePauseClick}
            className={`${isMobile ? 'w-9 h-9' : 'w-10 h-10'} flex items-center justify-center bg-gray-800 bg-opacity-70 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors`}
            aria-label="Pause Game"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? 16 : 18} height={isMobile ? 16 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
        )}
        
        <button
          onClick={handleRestartClick}
          className={`${isMobile ? 'w-9 h-9' : 'w-10 h-10'} flex items-center justify-center bg-gray-800 bg-opacity-70 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors`}
          aria-label="Restart Game"
        >
          <RefreshCw size={isMobile ? 16 : 18} />
        </button>
      </div>
      
      {/* Timer counter on mobile */}
      {isMobile && gameState === "playing" && (
        <div className={`fixed bottom-2 left-2 z-10 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
          timeLeft <= 5 
            ? 'bg-red-800 bg-opacity-80 text-white animate-pulse' 
            : timeLeft <= 10
              ? 'bg-yellow-800 bg-opacity-80 text-white' 
              : 'bg-slate-800 bg-opacity-80 text-white'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span className={timeLeft <= 5 ? 'font-bold' : ''}>
            {Math.ceil(timeLeft)}с
          </span>
        </div>
      )}
      
      {/* Модальное окно регистрации/входа */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        showRegisterPrompt={true}
      />
      
      {/* Full-screen menu overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className={`bg-gray-900 rounded-xl ${isMobile ? 'p-3 mx-2' : 'p-6'} w-full ${isMobile ? 'max-w-[95%]' : 'max-w-md'} shadow-2xl text-white`}>
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-center mb-2`}>
              {gameState === "game_over" ? "Game Over" : gameState === "ready" ? "Block Blast" : "Paused"}
            </h2>
            
            {gameState === "game_over" && (
              <div className="text-center mb-4">
                {/* Заголовок с информацией о завершении игры */}
                <div className="mb-2 bg-blue-900 bg-opacity-30 py-2 px-4 rounded-lg inline-block mx-auto">
                  <div className="text-white text-sm">Время вышло!</div>
                </div>
                
                {/* Основная статистика */}
                <div className="mb-4">
                  <div className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-yellow-300`}>{score}</div>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-200`}>Финальный счет</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white flex items-center justify-center gap-1`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1 5-5 10 10 0 0 0-10 0Z"></path>
                        <path d="M12 2v8"></path>
                        <path d="m12 18 5 4-2-6 5-3-6-1-2-6-2 6-6 1 5 3-2 6Z"></path>
                      </svg>
                      <span>{level}</span>
                    </div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-center text-blue-200`}>Уровень</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white flex items-center justify-center gap-1`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                        <path d="M8 11V5a2 2 0 0 1 4 0v6"></path>
                        <path d="M12 11V5a2 2 0 0 1 4 0v6"></path>
                        <circle cx="12" cy="17" r="2"></circle>
                        <line x1="12" y1="15" x2="12" y2="13"></line>
                        <path d="M16 7h2a2 2 0 0 1 2 2v6.8a3 3 0 0 1-.786 2.058L15.414 22H8.586L4.786 17.858A3 3 0 0 1 4 15.8V9a2 2 0 0 1 2-2h2"></path>
                      </svg>
                      <span>{highScore}</span>
                    </div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-center text-blue-200`}>Рекорд</p>
                  </div>
                </div>
                
                {/* Дополнительная статистика в компактном виде */}
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3 text-center">
                  {score > highScore ? (
                    <div className="bg-green-900 bg-opacity-40 border border-green-500 rounded-lg py-2 px-3 mb-3 flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <p className="text-green-400 text-sm font-medium">Новый рекорд!</p>
                    </div>
                  ) : null}
                  
                  <div className="text-sm text-white">
                    {score >= 1000 ? "Отличный результат!" : 
                     score >= 500 ? "Хороший счет!" : 
                     "Продолжайте улучшать результат!"}
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid gap-3 mt-4">
              <button
                onClick={handlePlayClick}
                className={`w-full ${isMobile ? 'py-2' : 'py-3'} px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors`}
              >
                {gameState === "game_over" ? "Play Again" : gameState === "ready" ? "Start Game" : "Resume"}
              </button>
              
              {gameState !== "ready" && (
                <button
                  onClick={handleRestartClick}
                  className={`w-full ${isMobile ? 'py-2' : 'py-3'} px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors`}
                >
                  Restart Game
                </button>
              )}
              
              {/* Предложение создать аккаунт после окончания игры */}
              {gameState === "game_over" && !isAuthenticated && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`w-full ${isMobile ? 'py-2' : 'py-3'} px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
                >
                  <UserPlus size={18} />
                  Сохранить прогресс
                </button>
              )}
              
              {/* Кнопка возврата в главное меню */}
              <button
                onClick={handleMainMenuClick}
                className={`w-full ${isMobile ? 'py-2' : 'py-3'} px-4 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
              >
                <HomeIcon size={18} />
                Main Menu
              </button>
              
              <div className="flex items-center justify-center gap-4 mt-2">
                <button
                  onClick={handleToggleMute}
                  className={`flex items-center justify-center gap-2 ${isMobile ? 'py-1.5' : 'py-2'} px-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors`}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>{isMuted ? "Unmute" : "Mute"}</span>
                </button>
              </div>
            </div>
            
            <p className={`${isMobile ? 'text-2xs' : 'text-xs'} text-center text-gray-400 mt-4`}>
              Match 3 or more blocks of the same color to score points!
            </p>
          </div>
        </div>
      )}
    </>
  );
}
