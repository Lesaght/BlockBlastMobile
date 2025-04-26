import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import GameBoard from "./GameBoard";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { useAudio } from "@/lib/stores/useAudio";

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
      />
      <directionalLight 
        position={[-10, 10, 5]} 
        intensity={0.5} 
      />
    </>
  );
}

export default function Game() {
  const { 
    gameState
  } = useBlockGame();

  const backgroundMusic = useAudio((state) => state.backgroundMusic);
  const isMuted = useAudio((state) => state.isMuted);

  // Handle background music
  useEffect(() => {
    let mounted = true;

    if (backgroundMusic && !isMuted && gameState === "playing" && mounted) {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
    
    return () => {
      mounted = false;
      if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
      }
    };
  }, [backgroundMusic, isMuted, gameState]);

  // Game animation loop
  const updateTimeLeft = useBlockGame((state) => state.updateTimeLeft);

  useFrame((_, delta) => {
    if (gameState === "playing") {
      updateTimeLeft(delta);
    }
  });

  // Если мы в меню, не рендерим игровую доску
  if (gameState === "menu") {
    return (
      <Lighting />
    );
  }

  return (
    <>
      <Lighting />
      <GameBoard />
    </>
  );
}
