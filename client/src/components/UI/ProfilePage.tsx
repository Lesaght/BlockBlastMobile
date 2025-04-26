import React from 'react';
import { useBlockGame } from '@/lib/stores/useBlockGame';
import { motion } from 'framer-motion';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Award, 
  User, 
  Gamepad as GameController, 
  BarChart, 
  Calendar, 
  Target, 
  Medal,
  Zap,
  History,
  Crown,
  UserCircle,
  Settings,
  ChevronRight,
  LineChart,
  Timer,
  Flag
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Progress } from '@/components/ui/progress';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function ProfilePage() {
  const username = useBlockGame((state) => state.username);
  const highScore = useBlockGame((state) => state.highScore);
  const level = useBlockGame((state) => state.level);
  const totalGames = useBlockGame((state) => state.totalGames);
  const syncProgressWithServer = useBlockGame((state) => state.syncProgressWithServer);
  const logout = useBlockGame((state) => state.logout);
  const isMobile = useIsMobile();

  let allScores = [];
  try {
    const scoresData = localStorage.getItem("blockBlast_allScores");
    allScores = scoresData ? JSON.parse(scoresData) : [];
  } catch (error) {
    console.error("Ошибка при парсинге результатов игр:", error);
    allScores = [];
  }

  const dateJoined = localStorage.getItem("blockBlast_dateJoined") || new Date().toISOString();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const averageScore = allScores.length > 0 
    ? Math.round(allScores.reduce((acc: number, score: number) => acc + score, 0) / allScores.length) 
    : 0;

  const achievements = [
    {
      name: "Новичок",
      description: "Первая игра",
      unlocked: totalGames > 0,
      icon: <GameController className="text-emerald-400" />,
      progress: Math.min(totalGames, 1) * 100
    },
    {
      name: "Исследователь",
      description: "Достигните 5 уровня",
      unlocked: level >= 5,
      icon: <Target className="text-blue-400" />,
      progress: (Math.min(level, 5) / 5) * 100
    },
    {
      name: "Чемпион",
      description: "Наберите 1000 очков",
      unlocked: highScore >= 1000,
      icon: <Trophy className="text-amber-400" />,
      progress: (Math.min(highScore, 1000) / 1000) * 100
    },
    {
      name: "Ветеран",
      description: "Сыграйте 10 игр",
      unlocked: totalGames >= 10,
      icon: <Medal className="text-purple-400" />,
      progress: (Math.min(totalGames, 10) / 10) * 100
    },
    {
      name: "Мастер",
      description: "Достигните 10 уровня",
      unlocked: level >= 10,
      icon: <Crown className="text-amber-500" />,
      progress: (Math.min(level, 10) / 10) * 100
    }
  ];

  const handleSync = () => {
    syncProgressWithServer();
  };

  const statsCards = [
    {
      title: "Игровая статистика",
      icon: <LineChart className="w-5 h-5 text-blue-500" />,
      items: [
        { label: "Рекорд", value: highScore, color: "text-yellow-500" },
        { label: "Ср. счёт", value: averageScore, color: "text-blue-500" },
        { label: "Уровень", value: level, color: "text-green-500" },
      ]
    },
    {
      title: "Достижения",
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      items: [
        { label: "Всего", value: achievements.length, color: "text-purple-500" },
        { label: "Получено", value: achievements.filter(a => a.unlocked).length, color: "text-green-500" },
        { label: "Прогресс", value: `${Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%`, color: "text-blue-500" },
      ]
    },
    {
      title: "Активность",
      icon: <Timer className="w-5 h-5 text-green-500" />,
      items: [
        { label: "Игр сыграно", value: totalGames, color: "text-blue-500" },
        { label: "Дней в игре", value: Math.ceil((Date.now() - new Date(dateJoined).getTime()) / (1000 * 60 * 60 * 24)), color: "text-purple-500" },
        { label: "Побед", value: allScores.filter(score => score > 500).length, color: "text-green-500" },
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8 max-h-[85vh] overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8"
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                {username?.[0]?.toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{username}</h1>
              <p className="text-white/80 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                С нами с {formatDate(dateJoined)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    {card.icon}
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {card.items.map((item, i) => (
                      <div key={i} className="text-center">
                        <div className={`text-2xl font-bold ${item.color}`}>
                          {item.value}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="text-yellow-500" />
                Достижения
              </CardTitle>
              <CardDescription>
                Разблокировано {achievements.filter(a => a.unlocked).length} из {achievements.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-lg ${
                    achievement.unlocked 
                      ? 'bg-gray-700/50 border border-gray-600/50' 
                      : 'bg-gray-800/30 border border-gray-700/30'
                  } p-4`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      achievement.unlocked ? 'bg-gray-600/50' : 'bg-gray-700/30'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{achievement.name}</h4>
                        {achievement.unlocked && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            Получено
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                      <div className="mt-2">
                        <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Games */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <History className="text-purple-500" />
                Последние игры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {allScores.slice(-8).map((score, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600/50"
                  >
                    <div className="text-lg font-bold">{score}</div>
                    <div className="text-xs text-gray-400">очков</div>
                  </div>
                ))}
                {allScores.length === 0 && (
                  <div className="text-gray-400 text-sm">
                    Нет завершенных игр
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-end"
        >
          <Button
            variant="outline"
            onClick={handleSync}
            className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
          >
            <Zap className="w-4 h-4 mr-2" />
            Синхронизировать
          </Button>
          <Button
            variant="destructive"
            onClick={logout}
            className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
          >
            Выйти
          </Button>
        </motion.div>
      </div>
    </div>
  );
}