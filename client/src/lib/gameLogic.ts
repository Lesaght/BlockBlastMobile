export interface BlockType {
  id: string;
  colorIndex: number;
  special?: {
    type: "bomb" | "rainbow" | "star";
    multiplier: number;
  };
}

export function createSpecialBlock(type: "bomb" | "rainbow" | "star"): BlockType["special"] {
  return {
    type,
    multiplier: type === "star" ? 2 : type === "rainbow" ? 3 : 5
  };
}

// Create a grid with random colored blocks
export function createInitialGrid(rows: number, cols: number, colorCount: number): (BlockType | null)[][] {
  const grid: (BlockType | null)[][] = [];
  
  for (let row = 0; row < rows; row++) {
    const newRow: (BlockType | null)[] = [];
    for (let col = 0; col < cols; col++) {
      newRow.push({
        id: `block-${row}-${col}`,
        colorIndex: Math.floor(Math.random() * colorCount)
      });
    }
    grid.push(newRow);
  }
  
  // Убедимся, что на начальной сетке всегда есть возможные ходы
  return ensurePlayableMoves(grid, rows, cols, colorCount);
}

// Check if two blocks are adjacent (orthogonally or diagonally)
export function isAdjacent(row1: number, col1: number, row2: number, col2: number): boolean {
  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);
  
  // Orthogonal adjacency (up, down, left, right)
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// Find blocks that match a specific color (recursively)
export function findMatchingBlocks(
  grid: (BlockType | null)[][], 
  row: number, 
  col: number, 
  colorIndex: number, 
  visited: Set<string> = new Set()
): string[] {
  const rowCount = grid.length;
  if (rowCount === 0) return [];
  
  const colCount = grid[0].length;
  const key = `${row},${col}`;
  
  // If we've already visited this cell or it's out of bounds or not the right color, skip it
  if (
    visited.has(key) || 
    row < 0 || 
    row >= rowCount || 
    col < 0 || 
    col >= colCount || 
    !grid[row][col] || 
    grid[row][col]?.colorIndex !== colorIndex
  ) {
    return [];
  }
  
  // Mark this cell as visited
  visited.add(key);
  const matches = [key];
  
  // Check adjacent blocks (4-directional)
  const directions = [
    [0, 1],  // right
    [1, 0],  // down
    [0, -1], // left
    [-1, 0]  // up
  ];
  
  for (const [dr, dc] of directions) {
    const newMatches = findMatchingBlocks(grid, row + dr, col + dc, colorIndex, visited);
    matches.push(...newMatches);
  }
  
  return matches;
}

// Apply gravity to the grid after blocks are removed
export function applyGravity(
  grid: (BlockType | null)[][], 
  matchedBlocks: Set<string>,
  rows: number,
  cols: number,
  colorCount: number = 5
): [(BlockType | null)[][], BlockType[]] {
  // Create a deep copy of the grid
  const newGrid = grid.map(row => [...row]);
  const newBlocks: BlockType[] = [];
  
  // First, remove matched blocks
  matchedBlocks.forEach(key => {
    const [row, col] = key.split(',').map(Number);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      newGrid[row][col] = null;
    }
  });
  
  // Then, apply gravity (column by column)
  for (let col = 0; col < cols; col++) {
    let emptySpaces = 0;
    
    // Bottom to top approach
    for (let row = rows - 1; row >= 0; row--) {
      if (newGrid[row][col] === null) {
        emptySpaces++;
      } else if (emptySpaces > 0) {
        // Move block down by the empty spaces count
        newGrid[row + emptySpaces][col] = newGrid[row][col];
        newGrid[row][col] = null;
      }
    }
    
    // Fill the top with new blocks
    for (let row = 0; row < emptySpaces; row++) {
      const newBlock: BlockType = {
        id: `block-new-${row}-${col}`,
        colorIndex: Math.floor(Math.random() * colorCount)
      };
      newGrid[row][col] = newBlock;
      newBlocks.push(newBlock);
    }
  }
  
  // Проверим, что есть возможные ходы после обновления сетки
  const [playableGrid, wasModified] = ensurePlayableMovesWithStatus(newGrid, rows, cols, colorCount);
  
  return [wasModified ? playableGrid : newGrid, newBlocks];
}

// Проверяет наличие возможных ходов (минимум 3 блока одного цвета)
export function hasValidMoves(grid: (BlockType | null)[][]): boolean {
  const rows = grid.length;
  if (rows === 0) return false;
  
  const cols = grid[0].length;
  const visited = new Set<string>();
  
  // Проверяем каждую ячейку сетки
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const currentBlock = grid[row][col];
      if (!currentBlock) continue;
      
      const key = `${row},${col}`;
      if (visited.has(key)) continue;
      
      // Найти все связанные блоки того же цвета
      const matches = findMatchingBlocks(grid, row, col, currentBlock.colorIndex);
      
      // Если есть минимум 3 связанных блока, есть возможный ход
      if (matches.length >= 3) {
        return true;
      }
      
      // Отметить все найденные блоки как посещенные
      matches.forEach(coord => visited.add(coord));
    }
  }
  
  // Если мы здесь, то не нашли возможных ходов
  return false;
}

// Перемешивает блоки на сетке, пока не появятся возможные ходы
export function shuffleGrid(
  grid: (BlockType | null)[][], 
  rows: number, 
  cols: number, 
  colorCount: number
): (BlockType | null)[][] {
  console.log("Перемешиваем сетку для создания возможных ходов...");
  
  const blocks: BlockType[] = [];
  const positions: [number, number][] = [];
  
  // Соберем все блоки и их позиции
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const block = grid[row][col];
      if (block) {
        blocks.push(block);
        positions.push([row, col]);
      }
    }
  }
  
  // Перемешать блоки
  for (let i = blocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  }
  
  // Создать новую сетку с перемешанными блоками
  const newGrid = Array(rows).fill(null).map(() => Array(cols).fill(null));
  for (let i = 0; i < blocks.length; i++) {
    const [row, col] = positions[i];
    
    // Обновляем ID блока для соответствия новой позиции
    blocks[i].id = `block-${row}-${col}`;
    
    // Случайно изменим цвет некоторых блоков для большего разнообразия
    if (Math.random() < 0.3) {
      blocks[i].colorIndex = Math.floor(Math.random() * colorCount);
    }
    
    newGrid[row][col] = blocks[i];
  }
  
  return newGrid;
}

// Убедиться, что на сетке всегда есть возможные ходы
export function ensurePlayableMoves(
  grid: (BlockType | null)[][], 
  rows: number, 
  cols: number, 
  colorCount: number
): (BlockType | null)[][] {
  let currentGrid = grid;
  let attempts = 0;
  const maxAttempts = 5; // Предотвращает бесконечный цикл
  
  while (!hasValidMoves(currentGrid) && attempts < maxAttempts) {
    currentGrid = shuffleGrid(currentGrid, rows, cols, colorCount);
    attempts++;
  }
  
  // Если после всех попыток всё равно нет ходов, создаем новую сетку
  if (!hasValidMoves(currentGrid)) {
    console.log("Создаем новую сетку после неудачных попыток перемешивания");
    return createInitialGrid(rows, cols, colorCount);
  }
  
  return currentGrid;
}

// То же самое, что и ensurePlayableMoves, но также возвращает флаг изменения
export function ensurePlayableMovesWithStatus(
  grid: (BlockType | null)[][],
  rows: number,
  cols: number,
  colorCount: number
): [(BlockType | null)[][], boolean] {
  if (hasValidMoves(grid)) {
    return [grid, false]; // Сетка не изменена
  }
  
  const newGrid = ensurePlayableMoves(grid, rows, cols, colorCount);
  return [newGrid, true]; // Сетка была изменена
}
