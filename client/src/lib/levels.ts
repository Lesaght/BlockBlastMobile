
export interface LevelConfig {
  level: number;
  rows: number;
  cols: number;
  colorCount: number;
  targetScore: number;
  timeLimit: number; // время в секундах
}

// Level difficulty progression
const levelConfigurations: LevelConfig[] = [
  // Level 1 - Very Easy
  {
    level: 1,
    rows: 6,
    cols: 5,
    colorCount: 3,
    targetScore: 500,
    timeLimit: 60
  },
  // Level 2
  {
    level: 2,
    rows: 6,
    cols: 5,
    colorCount: 4,
    targetScore: 1000,
    moves: 15
  },
  // Level 3
  {
    level: 3,
    rows: 7,
    cols: 6,
    colorCount: 4,
    targetScore: 1500,
    moves: 20
  },
  // Level 4
  {
    level: 4,
    rows: 7,
    cols: 6,
    colorCount: 5,
    targetScore: 2000,
    moves: 20
  },
  // Level 5
  {
    level: 5,
    rows: 8,
    cols: 7,
    colorCount: 5,
    targetScore: 2500,
    moves: 25
  },
  // Level 6
  {
    level: 6,
    rows: 8,
    cols: 7,
    colorCount: 6,
    targetScore: 3000,
    moves: 25
  },
  // Level 7
  {
    level: 7,
    rows: 9,
    cols: 8,
    colorCount: 6,
    targetScore: 3500,
    moves: 30
  },
  // Level 8
  {
    level: 8,
    rows: 9,
    cols: 8,
    colorCount: 7,
    targetScore: 4000,
    moves: 30
  },
  // Level 9
  {
    level: 9,
    rows: 10,
    cols: 9,
    colorCount: 7,
    targetScore: 4500,
    moves: 35
  },
  // Level 10
  {
    level: 10,
    rows: 10,
    cols: 9,
    colorCount: 8,
    targetScore: 5000,
    moves: 35
  }
];

// Get level configuration, with fallback for levels beyond the defined ones
export function getLevelConfig(level: number): LevelConfig {
  // If the level is defined, return it
  const definedLevel = levelConfigurations.find(config => config.level === level);
  if (definedLevel) {
    return definedLevel;
  }
  
  // For levels beyond our defined range, scale up the difficulty
  const lastLevel = levelConfigurations[levelConfigurations.length - 1];
  const levelDiff = level - lastLevel.level;
  
  return {
    level,
    rows: Math.min(12, lastLevel.rows + Math.floor(levelDiff / 2)),
    cols: Math.min(10, lastLevel.cols + Math.floor(levelDiff / 2)),
    colorCount: Math.min(8, lastLevel.colorCount + Math.floor(levelDiff / 3)),
    targetScore: lastLevel.targetScore + (levelDiff * 500),
    moves: lastLevel.moves + (levelDiff * 5)
  };
}
