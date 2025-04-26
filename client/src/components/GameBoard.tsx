import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { useDisplaySettings } from "@/lib/stores/useDisplaySettings";
import Block from "./Block";
import BlockEffects from "./effects/BlockEffects";
import { useAudio } from "@/lib/stores/useAudio";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function GameBoard() {
  const { camera } = useThree();
  const boardRef = useRef<THREE.Group>(null);
  const isMobile = useIsMobile();
  const [activeCursor, setActiveCursor] = useState<[number, number] | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  
  // Получаем настройки отображения
  const showHints = useDisplaySettings((state) => state.showHints);
  // Дополнительный лог для проверки статуса подсказок
  useEffect(() => {
    console.log("GameBoard: статус подсказок =", showHints ? "включены" : "выключены");
  }, [showHints]);
  
  const { 
    grid, 
    selectedBlocks, 
    matchedBlocks, 
    dimensions, 
    selectBlock, 
    checkForMatches,
    updateGrid,
    gameState,
    isAuthenticated,
    syncProgressWithServer,
    checkValidMoves
  } = useBlockGame();
  
  const playHit = useAudio((state) => state.playHit);
  const playSuccess = useAudio((state) => state.playSuccess);

  // Функция для поиска соседних блоков того же цвета
  const getAdjacentSameColorBlocks = useCallback((row: number, col: number): string[] => {
    const result: string[] = [];
    const targetBlock = grid[row]?.[col];
    if (!targetBlock) return result;
    
    const colorIndex = targetBlock.colorIndex;
    const visited = new Set<string>();
    const queue: [number, number][] = [[row, col]];
    
    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const key = `${r},${c}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (r !== row || c !== col) { // Не добавляем исходный блок
        result.push(key);
      }
      
      // Проверяем соседей
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Верх, Низ, Лево, Право
      for (const [dr, dc] of directions) {
        const newRow = r + dr;
        const newCol = c + dc;
        const newKey = `${newRow},${newCol}`;
        
        if (
          newRow >= 0 && newRow < grid.length &&
          newCol >= 0 && newCol < grid[0].length &&
          grid[newRow][newCol]?.colorIndex === colorIndex &&
          !visited.has(newKey) &&
          !matchedBlocks.has(newKey)
        ) {
          queue.push([newRow, newCol]);
        }
      }
    }
    
    return result;
  }, [grid, matchedBlocks]);

  // Эффект для отображения подсказок возможных ходов
  useEffect(() => {
    if (gameState !== "playing" || !showHints) {
      setPossibleMoves([]);
      return;
    }
    
    // Находим возможные ходы
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const possibleMovesList: string[] = [];
    
    // Проверяем каждую ячейку на потенциальный ход
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const blockKey = `${row},${col}`;
        const block = grid[row]?.[col];
        if (block && !matchedBlocks.has(blockKey)) {
          // Если мы можем выбрать этот блок, добавляем его в список подсказок
          const adjBlocks = getAdjacentSameColorBlocks(row, col);
          if (adjBlocks.length >= 2) { // Требуется минимум 3 блока (текущий + 2 соседних)
            possibleMovesList.push(blockKey);
            // Добавляем также соседние блоки того же цвета
            adjBlocks.forEach(key => possibleMovesList.push(key));
          }
        }
      }
    }
    
    // Обновляем состояние с уникальными ключами блоков
    const uniqueMoves = Array.from(new Set(possibleMovesList));
    setPossibleMoves(uniqueMoves);
  }, [gameState, grid, showHints, matchedBlocks, getAdjacentSameColorBlocks]);
  
  // Кэшируем настройки сетки с помощью useMemo
  const gridSettings = useMemo(() => {
    // Adjust block spacing for mobile devices
    const blockSpacing = isMobile ? 0.9 : 1.0;
    
    // Calculate the offset to center the grid
    const rowOffset = (dimensions.rows - 1) / 2;
    const colOffset = (dimensions.cols - 1) / 2;
    
    return { blockSpacing, rowOffset, colOffset };
  }, [dimensions, isMobile]);
  
  // Распаковываем значения из кэшированных настроек сетки
  const { blockSpacing, rowOffset, colOffset } = gridSettings;

  // Position camera to view the entire grid, optimized for mobile
  useEffect(() => {
    if (camera && boardRef.current && dimensions) {
      // Calculate optimal camera position based on grid dimensions and device
      const maxDimension = Math.max(dimensions.rows, dimensions.cols);
      let distance = maxDimension * 1.2;
      
      // Adjust camera for mobile devices - move it a bit further back
      if (isMobile) {
        distance = maxDimension * 1.5;
        camera.position.set(0, distance * 0.9, distance);
      } else {
        camera.position.set(0, distance * 0.8, distance);
      }
      
      camera.lookAt(0, 0, 0);
    }
  }, [camera, dimensions, isMobile]);
  
  // Периодическая синхронизация прогресса с сервером
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Синхронизируем данные только если игра запущена
    if (gameState !== "playing") return;
    
    // Интервал синхронизации - 30 секунд
    const syncInterval = setInterval(() => {
      console.log("Синхронизация прогресса с сервером...");
      syncProgressWithServer();
    }, 30000); // 30 секунд
    
    return () => clearInterval(syncInterval);
  }, [isAuthenticated, syncProgressWithServer, gameState]);
  
  // Handle block selection
  const handleBlockClick = useCallback((row: number, col: number) => {
    if (gameState !== "playing" || !grid || !grid[row] || !grid[row][col]) return;
    
    const block = grid[row][col];
    if (!block || matchedBlocks.has(`${row},${col}`) || !selectBlock) return;
    
    playHit();
    selectBlock(row, col);
    
    // After a block is selected, check for matches
    setTimeout(() => {
      const matchFound = checkForMatches();
      if (matchFound) {
        playSuccess();
        setTimeout(() => {
          updateGrid();
        }, 300);
      }
    }, 100);
  }, [gameState, grid, matchedBlocks, playHit, selectBlock, checkForMatches, playSuccess, updateGrid]);
  
  // Обработчик клавиатурных событий для активного курсора
  useEffect(() => {
    let mounted = true;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mounted) return;
      if (gameState !== "playing") return;
      
      if (!activeCursor && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        // Если курсор не активен, установим его на центр сетки
        const centerRow = Math.floor(dimensions.rows / 2);
        const centerCol = Math.floor(dimensions.cols / 2);
        setActiveCursor([centerRow, centerCol]);
        return;
      }
      
      if (activeCursor) {
        const [currentRow, currentCol] = activeCursor;
        let newRow = currentRow;
        let newCol = currentCol;
        
        // Перемещение курсора по сетке
        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, currentRow - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(dimensions.rows - 1, currentRow + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, currentCol - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(dimensions.cols - 1, currentCol + 1);
            break;
          case ' ': // Пробел для выбора блока
          case 'Space':
            handleBlockClick(currentRow, currentCol);
            break;
        }
        
        // Обновить положение активного курсора
        if (newRow !== currentRow || newCol !== currentCol) {
          setActiveCursor([newRow, newCol]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCursor, dimensions, gameState, handleBlockClick]);
  
  // Рендерер активного курсора на сетке (визуальный индикатор)
  const renderCursor = useCallback(() => {
    if (!activeCursor) return null;
    
    const [row, col] = activeCursor;
    const position: [number, number, number] = [
      (col - colOffset) * blockSpacing,
      0.5, // Чуть выше плоскости блоков
      (row - rowOffset) * blockSpacing
    ];
    
    return (
      <mesh position={position}>
        <ringGeometry args={[0.6, 0.7, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    );
  }, [activeCursor, blockSpacing, colOffset, rowOffset]);

  return (
    <group ref={boardRef} position={[0, 0, 0]}>
      {/* Game board background */}
      <mesh position={[0, -0.5, 0]} receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[dimensions.cols * blockSpacing + 2, dimensions.rows * blockSpacing + 2]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>

      {/* Render blocks */}
      {grid.map((row, rowIndex) =>
        row.map((block, colIndex) => {
          if (!block) return null;
          
          // Adjust positions for mobile to make blocks closer together
          const position: [number, number, number] = [
            (colIndex - colOffset) * blockSpacing,
            0,
            (rowIndex - rowOffset) * blockSpacing
          ];
          
          const blockKey = `${rowIndex},${colIndex}`;
          const isSelected = selectedBlocks.has(blockKey);
          const isMatched = matchedBlocks.has(blockKey);
          const isHint = showHints && possibleMoves.includes(blockKey);
          const animationDelay = rowIndex * 50 + colIndex * 30;
          
          return (
            <Block 
              key={blockKey}
              block={block}
              position={position}
              onClick={() => handleBlockClick(rowIndex, colIndex)}
              isSelected={isSelected}
              isMatched={isMatched}
              isHint={isHint}
              animationDelay={animationDelay}
            />
          );
        })
      )}
      
      {/* Active cursor indicator */}
      {renderCursor()}
      
      {/* Special effects for block interactions */}
      <BlockEffects />
    </group>
  );
}