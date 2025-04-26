import { useBlockGame } from "@/lib/stores/useBlockGame";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function LevelIndicator() {
  const level = useBlockGame((state) => state.level);
  const targetScore = useBlockGame((state) => state.targetScore);
  const score = useBlockGame((state) => state.score);
  const isMobile = useIsMobile();
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.floor((score / targetScore) * 100));
  
  return (
    <div className="flex items-center gap-2 bg-gray-800 bg-opacity-70 px-3 py-1.5 rounded-full">
      <span className="text-white font-medium">Уровень {level}</span>
      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <span className="text-white text-sm">{score}/{targetScore}</span>
    </div>
  );

  return (
    <div className={`fixed ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-10 bg-slate-800 bg-opacity-80 text-white ${isMobile ? 'p-2' : 'p-3'} rounded-lg shadow-lg`}>
      <div className="flex justify-between items-center mb-1">
        <span className={`${isMobile ? 'text-2xs' : 'text-xs'} uppercase tracking-wider opacity-80`}>Level</span>
        <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>{level}</span>
      </div>
      
      {/* Progress bar */}
      <div className={`${isMobile ? 'w-24 h-1.5' : 'w-32 h-2'} bg-gray-700 rounded-full overflow-hidden`}>
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className={`${isMobile ? 'text-2xs' : 'text-xs'} mt-1 text-right opacity-70`}>
        {currentLevelPoints} / {pointsNeeded}
      </div>
    </div>
  );
}
