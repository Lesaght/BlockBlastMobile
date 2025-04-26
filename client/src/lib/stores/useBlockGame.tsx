import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { 
  BlockType, 
  createInitialGrid, 
  isAdjacent, 
  findMatchingBlocks, 
  applyGravity,
  hasValidMoves,
  shuffleGrid
} from "@/lib/gameLogic";
import { getLevelConfig } from "@/lib/levels";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";
import axios from 'axios';

export type GameState = "loading" | "menu" | "ready" | "playing" | "paused" | "shuffling" | "game_over";

// Prevent race conditions in state updates
let stateUpdateTimeout: NodeJS.Timeout | null = null;

export const safeStateUpdate = (store: any, update: () => void, delay = 100) => {
  if (stateUpdateTimeout) {
    clearTimeout(stateUpdateTimeout);
  }
  stateUpdateTimeout = setTimeout(() => {
    update();
    stateUpdateTimeout = null;
  }, delay);
};

interface BlockGameState {
  // Game state
  gameState: GameState;
  score: number;
  highScore: number;
  isAuthenticated: boolean;
  username: string | null;
  level: number;
  targetScore: number;
  timeLeft: number;
  dimensions: { rows: number; cols: number };
  colorCount: number;
  message: string | null;
  totalGames: number;
  setIsAuthenticated: (value: boolean) => void;
  setUsername: (username: string | null) => void;
  logout: () => void;
  syncProgressWithServer: () => Promise<void>;

  // Grid and block state
  grid: (BlockType | null)[][];
  selectedBlocks: Set<string>;
  matchedBlocks: Set<string>;

  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  endGame: () => void;
  advanceLevel: () => void;

  // Game mechanics
  selectBlock: (row: number, col: number) => void;
  checkForMatches: () => boolean;
  updateGrid: () => void;
  addScore: (points: number) => void;
  checkValidMoves: () => boolean;
  shuffleBoard: () => void;
  clearMessage: () => void;
  lastMatchTime: number;
  comboMultiplier: number;
}

export const useBlockGame = create<BlockGameState>()(
  subscribeWithSelector((set, get) => ({
    // Initialize game state
    gameState: "menu",
    score: 0,
    highScore: getLocalStorage("blockBlast_highScore") || 0,
    isAuthenticated: false,
    username: null,
    level: 1,
    targetScore: 1000,
    timeLeft: 60,
    dimensions: { rows: 8, cols: 7 },
    colorCount: 5,
    message: null,
    lastMatchTime: 0,
    comboMultiplier: 1,
    totalGames: getLocalStorage("blockBlast_totalGames") || 0,
    setIsAuthenticated: (value: boolean) => {
      set({ isAuthenticated: value });

      // Если пользователь авторизовался, сохраняем дату регистрации и загружаем прогресс
      if (value === true) {
        // Проверяем, есть ли дата регистрации, если нет - сохраняем текущую
        if (!localStorage.getItem("blockBlast_dateJoined")) {
          localStorage.setItem("blockBlast_dateJoined", new Date().toISOString());
        }
        
        const loadPlayerProgress = async () => {
          try {
            const response = await fetch('/api/player/progress', {
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success && data.progress) {
                const serverProgress = data.progress;
                
                // Обновляем состояние игры данными с сервера, если они выше локальных
                const currentHighScore = get().highScore;
                if (serverProgress.high_score > currentHighScore) {
                  set({
                    highScore: serverProgress.high_score,
                    level: serverProgress.max_level > 1 ? serverProgress.max_level : 1
                  });
                  
                  // Также обновляем локальное хранилище
                  setLocalStorage("blockBlast_highScore", serverProgress.high_score);
                  setLocalStorage("blockBlast_levelReached", serverProgress.max_level);
                  
                  if (serverProgress.stats && Array.isArray(serverProgress.stats.allScores)) {
                    setLocalStorage("blockBlast_allScores", serverProgress.stats.allScores);
                  }
                  
                  console.log("Прогресс игрока загружен с сервера:", serverProgress);
                }
              }
            }
          } catch (error) {
            console.error("Ошибка при загрузке прогресса с сервера:", error);
          }
        };
        
        loadPlayerProgress();
      }
    },
    
    setUsername: (username: string | null) => set({ username }),
    
    logout: async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ 
          isAuthenticated: false, 
          username: null
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
    
    // Функция для синхронизации прогресса с сервером
    syncProgressWithServer: async () => {
      const { isAuthenticated, highScore, level, username } = get();
      
      if (!isAuthenticated || !username) {
        console.log("Синхронизация пропущена: пользователь не аутентифицирован");
        return;
      }
      
      console.log("Синхронизация прогресса с сервером...");
      
      try {
        const allScores = getLocalStorage("blockBlast_allScores") || [];
        const totalGames = getLocalStorage("blockBlast_totalGames") || 0;
        
        const response = await fetch('/api/player/progress', {
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            high_score: highScore || 0,
            max_level: level || 1,
            total_games: totalGames || 0,
            stats: {
              allScores: Array.isArray(allScores) ? allScores : [],
              achievements: []
            },
            last_synced: new Date().toISOString()
          })
        });
        
        if (!response.ok) {
          console.error("Ошибка синхронизации: HTTP статус", response.status);
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log("Прогресс синхронизирован с сервером", data);
          
          // Если сервер вернул данные, проверяем и обновляем локальное состояние
          if (data.progress) {
            const serverData = data.progress;
            
            // При первоначальной синхронизации или если на сервере более новые данные
            if (data.action === 'server_sync' || serverData.high_score > (highScore || 0)) {
              set({
                highScore: serverData.high_score || 0,
                level: serverData.max_level || 1,
                totalGames: serverData.total_games || 0
              });
              
              setLocalStorage("blockBlast_highScore", serverData.high_score || 0);
              setLocalStorage("blockBlast_levelReached", serverData.max_level || 1);
              setLocalStorage("blockBlast_totalGames", serverData.total_games || 0);
              
              if (serverData.stats && Array.isArray(serverData.stats.allScores)) {
                setLocalStorage("blockBlast_allScores", serverData.stats.allScores);
              }
            }
          }
        }
      } catch (error) {
        console.error("Ошибка при синхронизации с сервером:", error);
      }
    },

    // Initialize grid
    grid: [],
    selectedBlocks: new Set(),
    matchedBlocks: new Set(),

    // Actions
    startGame: () => {
      const levelConfig = getLevelConfig(1);
      const initialGrid = createInitialGrid(levelConfig.rows, levelConfig.cols, levelConfig.colorCount);

      set({
        gameState: "playing",
        score: 0,
        level: 1,
        targetScore: levelConfig.targetScore,
        timeLeft: levelConfig.timeLimit,
        dimensions: { rows: levelConfig.rows, cols: levelConfig.cols },
        colorCount: levelConfig.colorCount,
        grid: initialGrid,
        selectedBlocks: new Set(),
        matchedBlocks: new Set(),
        message: "Уровень 1 — Начинаем!",
        lastMatchTime: 0,
        comboMultiplier: 1
      });

      setTimeout(() => {
        set(state => {
          if (state.message === "Уровень 1 — Начинаем!" && state.gameState === "playing") {
            return { message: null };
          }
          return state;
        });
      }, 1500);
    },

    pauseGame: () => set({ gameState: "paused" }),

    resumeGame: () => set({ gameState: "playing" }),

    restartGame: () => {
      console.log("=== ПЕРЕЗАПУСК УРОВНЯ ===");
      
      const { level, score } = get();
      console.log("Текущие значения:", { level, score });
      
      const levelConfig = getLevelConfig(level);
      const initialGrid = createInitialGrid(levelConfig.rows, levelConfig.cols, levelConfig.colorCount);

      // Добавим отладочный вывод перед и после установки состояния
      console.log("Устанавливаем score: 0");
      
      set({
        gameState: "playing",
        score: 0, // Сбрасываем очки
        targetScore: levelConfig.targetScore,
        timeLeft: levelConfig.timeLimit, // Сбрасываем время
        dimensions: { rows: levelConfig.rows, cols: levelConfig.cols },
        colorCount: levelConfig.colorCount,
        grid: initialGrid,
        selectedBlocks: new Set(),
        matchedBlocks: new Set(),
        message: `Уровень ${level} — Начинаем заново!`,
        lastMatchTime: 0,
        comboMultiplier: 1
      });
      
      console.log("После установки score:", get().score);

      setTimeout(() => {
        set(state => {
          if (state.message === `Уровень ${level} — Начинаем заново!` && state.gameState === "playing") {
            return { message: null };
          }
          return state;
        });
      }, 1500);
    },

    endGame: () => {
      const { score, highScore, level, gameState, isAuthenticated, username } = get();

      if (gameState === "game_over") {
        set({ timeLeft: 0 });
        return;
      }

      console.log("Game over - time's up!");

      try {
        const allScores = getLocalStorage("blockBlast_allScores") || [];
        const updatedScores = Array.isArray(allScores) 
          ? [...allScores, score].slice(-10) 
          : [score];

        const totalGames = getLocalStorage("blockBlast_totalGames") || 0;
        const newTotalGames = totalGames + 1;

        let newHighScore = highScore;
        if (score > highScore) {
          newHighScore = score;
          set({ highScore: score });
          setLocalStorage("blockBlast_highScore", score);
          setLocalStorage("blockBlast_levelReached", level);
        }

        // Обновляем totalGames в состоянии
        set({ totalGames: newTotalGames });
        
        setLocalStorage("blockBlast_totalGames", newTotalGames);
        setLocalStorage("blockBlast_allScores", updatedScores);
        setLocalStorage("blockBlast_lastScore", score);
        setLocalStorage("blockBlast_lastLevel", level);

        if (isAuthenticated && username) {
          const updateProgress = async () => {
            try {
              const response = await fetch('/api/player/progress', {
                credentials: 'include',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  high_score: newHighScore,
                  max_level: level,
                  total_games: newTotalGames,
                  stats: {
                    allScores: updatedScores,
                    achievements: []
                  },
                  last_synced: new Date().toISOString()
                })
              });

              if (!response.ok) {
                console.error("Ошибка при сохранении прогресса:", response.status);
                return;
              }

              const data = await response.json();
              if (data.success && data.action === 'server_sync') {
                const serverData = data.progress;
                if (serverData) {
                  set({
                    highScore: serverData.high_score || 0,
                    level: serverData.max_level || 1,
                    totalGames: serverData.total_games || 0,
                  });
                }
              }
            } catch (error) {
              console.error("Ошибка при сохранении прогресса на сервере:", error);
            }
          };
          updateProgress();
        }
      } catch (error) {
        console.error("Ошибка при сохранении статистики:", error);
      }

      set({ 
        gameState: "game_over", 
        timeLeft: 0,
        message: "Время вышло!"
      });

      setTimeout(() => {
        set(state => {
          if (state.message === "Время вышло!" && state.gameState === "game_over") {
            return { message: null };
          }
          return state;
        });
      }, 2000);
    },

    advanceLevel: () => {
      const { level, score, isAuthenticated, username } = get();
      const newLevel = level + 1;
      const levelConfig = getLevelConfig(newLevel);

      const newGrid = createInitialGrid(
        levelConfig.rows, 
        levelConfig.cols, 
        levelConfig.colorCount
      );

      set({
        level: newLevel,
        targetScore: levelConfig.targetScore,
        timeLeft: levelConfig.timeLimit,
        dimensions: { rows: levelConfig.rows, cols: levelConfig.cols },
        colorCount: levelConfig.colorCount,
        grid: newGrid,
        selectedBlocks: new Set(),
        matchedBlocks: new Set(),
        message: `Уровень ${newLevel} — Отлично!`,
        lastMatchTime: 0,
        comboMultiplier: 1
      });

      // Сохраняем достигнутый уровень в локальное хранилище
      setLocalStorage("blockBlast_levelReached", newLevel);
      
      // Если пользователь авторизован, синхронизируем прогресс с сервером
      if (isAuthenticated && username) {
        // Сохраняем серверную синхронизацию на следующий тик,
        // чтобы состояние игры успело обновиться
        setTimeout(() => {
          get().syncProgressWithServer();
        }, 500);
      }

      setTimeout(() => {
        set(state => {
          if (state.message === `Уровень ${newLevel} — Отлично!` && state.gameState === "playing") {
            return { message: null };
          }
          return state;
        });
      }, 2000);
    },

    selectBlock: (row: number, col: number) => {
      const { grid, selectedBlocks, gameState } = get();

      if (gameState !== "playing") return;

      const blockKey = `${row},${col}`;

      if (selectedBlocks.size === 0) {
        set({ selectedBlocks: new Set([blockKey]) });
        return;
      }

      const lastSelectedKey = Array.from(selectedBlocks).pop() || "";
      const [lastRow, lastCol] = lastSelectedKey.split(',').map(Number);

      if (isAdjacent(row, col, lastRow, lastCol)) {
        const currentBlock = grid[row][col];
        const lastBlock = grid[lastRow][lastCol];

        if (currentBlock && lastBlock && currentBlock.colorIndex === lastBlock.colorIndex) {
          const newSelectedBlocks = new Set(selectedBlocks);
          newSelectedBlocks.add(blockKey);
          set({ selectedBlocks: newSelectedBlocks });
        } else {
          set({ selectedBlocks: new Set([blockKey]) });
        }
      } else {
        set({ selectedBlocks: new Set([blockKey]) });
      }
    },

    checkForMatches: () => {
      const { grid, selectedBlocks } = get();

      if (selectedBlocks.size < 3) {
        return false;
      }

      const selectedBlocksArray = Array.from(selectedBlocks);

      const scoreMultiplier = Math.max(1, selectedBlocks.size - 2);
      const earnedPoints = selectedBlocks.size * 10 * scoreMultiplier;

      set((state) => {
        const newMatchedBlocks = new Set<string>(selectedBlocksArray);
        Array.from(state.matchedBlocks).forEach((block: string) => {
          newMatchedBlocks.add(block);
        });

        return {
          matchedBlocks: newMatchedBlocks,
          selectedBlocks: new Set<string>(),
        };
      });

      get().addScore(earnedPoints);

      return true;
    },

    updateGrid: () => {
      const { 
        grid, 
        matchedBlocks, 
        dimensions, 
        level, 
        score, 
        targetScore, 
        timeLeft, 
        colorCount,
        gameState 
      } = get();

      if (matchedBlocks.size === 0) return;

      const [updatedGrid, newBlocks] = applyGravity(grid, matchedBlocks, dimensions.rows, dimensions.cols, colorCount);

      set({
        grid: updatedGrid,
        matchedBlocks: new Set()
      });

      if (score >= targetScore) {
        get().advanceLevel();
        return;
      }

      setTimeout(() => {
        if (timeLeft > 0 && !hasValidMoves(updatedGrid)) {
          set({ 
            message: "Нет возможных ходов, перемешиваем доску...",
            gameState: "shuffling"
          });

          setTimeout(() => {
            get().shuffleBoard();
          }, 1500);
        }
      }, 500);

      if (timeLeft <= 0) {
        const currentGameState = get().gameState;
        
        if (currentGameState === "playing") {
          console.log("Timer reached zero - ending game");
          set({ gameState: "game_over" });
          get().endGame();
        }
      }
    },

    checkValidMoves: () => {
      const { grid } = get();
      return hasValidMoves(grid);
    },

    shuffleBoard: () => {
      const { grid, dimensions, colorCount, timeLeft } = get();

      const shuffledGrid = shuffleGrid(grid, dimensions.rows, dimensions.cols, colorCount);

      set({
        grid: shuffledGrid,
        gameState: "playing",
        message: "Доска перемешана! Продолжайте игру.",
        timeLeft: timeLeft
      });

      setTimeout(() => {
        get().clearMessage();
      }, 2000);
    },

    clearMessage: () => {
      set({ message: null });
    },

    updateTimeLeft: (delta: number) => {
      set((state) => {
        if (state.gameState !== "playing") return state;

        if (state.timeLeft <= 0) {
          setTimeout(() => {
            const currentState = get().gameState;
            if (currentState === "playing") {
              get().endGame();
            }
          }, 100);

          return { timeLeft: 0 };
        }

        const newTimeLeft = Math.max(0, state.timeLeft - delta);

        if (newTimeLeft <= 0) {
          setTimeout(() => get().endGame(), 200);
          return { timeLeft: 0 };
        }

        return { timeLeft: newTimeLeft };
      });
    },

    addScore: (points: number) => {
      set((state) => {
        const now = Date.now();
        const timeDiff = now - state.lastMatchTime;
        let multiplier = state.comboMultiplier;

        if (timeDiff < 1000) {
          multiplier = Math.min(multiplier + 0.5, 3);
        } else {
          multiplier = 1;
        }

        return {
          score: state.score + (points * multiplier),
          lastMatchTime: now,
          comboMultiplier: multiplier
        };
      });
    }
  }))
);