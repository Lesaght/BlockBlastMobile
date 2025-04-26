import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";
import { Html } from "@react-three/drei";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { BlockType } from "@/lib/gameLogic";
import { getBlockColor } from "@/lib/colors";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface BlockProps {
  block: BlockType;
  position: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
  isMatched: boolean;
  isHint?: boolean;
  animationDelay?: number;
}

export default function Block({ 
  block, 
  position, 
  onClick, 
  isSelected, 
  isMatched,
  isHint = false,
  animationDelay = 0 
}: BlockProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [initialScale] = useState(() => Math.random() * 0.2 + 0.9);
  const gameState = useBlockGame((state) => state.gameState);
  const isMobile = useIsMobile();
  const blockSize = useMemo(() => isMobile ? 0.75 : 0.8, [isMobile]);
  const color = useMemo(() => getBlockColor(block.colorIndex), [block.colorIndex]);

  const springValues = useMemo(() => {
    return {
      scale: isMatched ? 0 : isSelected ? 1.1 : hovered || isHint ? 1.05 : 1,
      rotation: isSelected ? [0, Math.PI, 0] as any : [0, 0, 0] as any,
      positionY: isMatched ? position[1] - 2 : isHint ? position[1] + 0.05 : position[1], 
      opacity: isMatched ? 0 : 1,
      // Added animation properties for enhanced effect
      scaleAnimation: isMatched ? 0 : isSelected ? 1.15 : isHint ? 1.05 : 1, // Reduced scale for better interaction
      rotationAnimation: isMatched ? 0 : isSelected ? Math.PI * 2 : 0 //Full rotation for selected blocks
    };
  }, [isMatched, isSelected, isHint, hovered, position]);

  const { scale, rotation, opacity, scaleAnimation, rotationAnimation } = useSpring({
    scale: springValues.scale,
    rotation: springValues.rotation,
    opacity: springValues.opacity,
    scaleAnimation: springValues.scaleAnimation,
    rotationAnimation: springValues.rotationAnimation,
    delay: animationDelay,
    config: { tension: 170, friction: 26 }
  });

  const introSpring = useSpring({
    from: { scaleIntro: 0, positionYIntro: position[1] + 5 },
    to: { scaleIntro: initialScale, positionYIntro: position[1] },
    delay: animationDelay * 100,
    config: { tension: 180, friction: 12 }
  });

  useFrame((_, delta) => {
    if (meshRef.current && isSelected && !isMatched) {
      //Enhanced rotation animation
      meshRef.current.rotation.y += delta * rotationAnimation.get();
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation(); 
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < 300) {
      return;
    }
    setLastClickTime(currentTime);
    if (gameState === "playing" && !isMatched) {
      onClick();
    }
  };

  const htmlContent = useMemo(() => {
    if (!isSelected && !isHint) return null;
    
    return (
      <Html center>
        <div 
          className="pointer-events-none absolute flex items-center justify-center"
          style={{ 
            opacity: isSelected ? 0.8 : 0.5, 
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '24px' : '32px',
            height: isMobile ? '24px' : '32px'
          }}
        >
          <div 
            className={`rounded-full ${isSelected ? 'bg-white opacity-30 animate-ping' : 'bg-blue-500 opacity-20 animate-pulse'}`}
            style={{
              width: isMobile ? '24px' : '32px',
              height: isMobile ? '24px' : '32px'
            }} 
          />
        </div>
      </Html>
    );
  }, [isSelected, isHint, isMobile]);

  return (
    <animated.mesh
      ref={meshRef}
      position-x={position[0]}
      position-y={introSpring.positionYIntro}
      position-z={position[2]}
      scale-x={scale.to( (s) => s * scaleAnimation.get())}
      scale-y={scale.to( (s) => s * scaleAnimation.get())}
      scale-z={scale.to( (s) => s * scaleAnimation.get())}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={() => !isMobile && setHovered(true)}
      onPointerOut={() => setHovered(false)}
      visible={!isMatched}
    >
      <boxGeometry args={[blockSize, blockSize, blockSize]} />
      <animated.meshPhysicalMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={0.3}
        metalness={0.2}
        emissive={isSelected ? color : isHint ? color : "#000000"}
        emissiveIntensity={isSelected ? 0.5 : isHint ? 0.3 : 0}
        toneMapped={true}
      />

      {htmlContent}
    </animated.mesh>
  );
}