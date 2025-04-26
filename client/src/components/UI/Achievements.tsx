
import { motion, AnimatePresence } from "framer-motion";
import { useAchievements } from "@/lib/achievements";

export default function Achievements() {
  const { achievements, unlockedAchievements } = useAchievements();
  
  return (
    <div className="fixed top-4 left-4 z-50">
      <AnimatePresence>
        {Array.from(unlockedAchievements).map((id) => {
          const achievement = achievements.find(a => a.id === id);
          if (!achievement) return null;
          
          return (
            <motion.div
              key={id}
              initial={{ x: -100, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -100, opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                bounce: 0.4
              }}
              className="bg-gray-800 bg-opacity-90 text-white rounded-lg p-3 mb-2 flex items-center"
            >
              <span className="text-2xl mr-2">{achievement.icon}</span>
              <div>
                <h3 className="font-bold">{achievement.name}</h3>
                <p className="text-sm opacity-80">{achievement.description}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
