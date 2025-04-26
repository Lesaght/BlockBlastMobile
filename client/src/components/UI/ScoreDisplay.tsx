import { useEffect, useState } from "react";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Clock, Trophy } from "lucide-react";

export default function ScoreDisplay() {
  const score = useBlockGame((state) => state.score);
  const highScore = useBlockGame((state) => state.highScore);
  const timeLeft = useBlockGame((state) => state.timeLeft);
  const gameState = useBlockGame((state) => state.gameState);
  const isAuthenticated = useBlockGame((state) => state.isAuthenticated);
  const username = useBlockGame((state) => state.username);
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const isMobile = useIsMobile();

  // Handle score animation
  useEffect(() => {
    // Если счёт равен 0, сразу сбрасываем displayScore на 0 (при перезагрузке уровня)
    if (score === 0) {
      console.log("ScoreDisplay: сброс score -> 0, текущий displayScore =", displayScore);
      setDisplayScore(0);
      setIsAnimating(false);
      console.log("ScoreDisplay: displayScore сброшен в 0");
      return;
    }
    
    if (score > displayScore) {
      setIsAnimating(true);
      const diff = score - displayScore;
      const increment = Math.max(1, Math.floor(diff / 10));

      const timer = setTimeout(() => {
        setDisplayScore(prev => Math.min(prev + increment, score));
      }, 50);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [score, displayScore]);

  // Handle time warning animation
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && gameState === "playing") {
      setIsTimeWarning(true);
    } else {
      setIsTimeWarning(false);
    }
  }, [timeLeft, gameState]);

  // Format time with minutes and seconds if necessary
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    } else {
      return `${remainingSeconds}`;
    }
  };

  const timeDisplay = formatTime(timeLeft);

  return (
    <div className={`fixed ${isMobile ? 'top-16 left-2' : 'top-20 left-4'} z-10 bg-slate-800 bg-opacity-80 text-white ${isMobile ? 'p-2' : 'p-3'} rounded-lg shadow-lg`}>
      {/* Current score */}
      <div className={`${isMobile ? 'text-2xs' : 'text-xs'} uppercase tracking-wider opacity-80 mb-0.5`}>Score</div>
      <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold ${isAnimating ? 'text-yellow-300 scale-110' : ''} transition-all`}>
        {displayScore}
      </div>
      
      {/* High score - Display only if user is authenticated or a highscore exists */}
      {(isAuthenticated || highScore > 0) && (
        <div className="mt-2">
          <div className={`flex items-center gap-1 ${isMobile ? 'text-2xs' : 'text-xs'} uppercase tracking-wider opacity-80`}>
            <Trophy size={isMobile ? 10 : 12} className="text-yellow-400" />
            <span>Рекорд</span>
            {username && <span className="italic text-xs opacity-75 ml-1">({username})</span>}
          </div>
          <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-yellow-400`}>
            {highScore}
          </div>
        </div>
      )}
      
      {/* Timer display with warning effect */}
      <div className={`flex items-center gap-1 mt-2 ${
        timeLeft <= 5 
          ? 'text-red-400 animate-pulse font-bold' 
          : timeLeft <= 10 
            ? 'text-yellow-300 font-semibold' 
            : ''
      }`}>
        <Clock size={isMobile ? 12 : 14} />
        <div className={`${isMobile ? 'text-sm' : 'text-base'} ${
          timeLeft === 0 ? 'text-white font-bold bg-red-900 px-1 rounded' : ''
        }`}>
          {timeDisplay}
        </div>
      </div>
    </div>
  );
}