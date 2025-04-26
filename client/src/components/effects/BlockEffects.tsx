import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { useDisplaySettings } from "@/lib/stores/useDisplaySettings";
import { getBlockColor } from "@/lib/colors";

export default function BlockEffects() {
  const { scene } = useThree();
  const particlesRef = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Points[]>([]);
  
  // Получаем настройки отображения
  const showAnimations = useDisplaySettings((state) => state.showAnimations);
  
  const matchedBlocks = useBlockGame((state) => state.matchedBlocks);
  const grid = useBlockGame((state) => state.grid);
  const dimensions = useBlockGame((state) => state.dimensions);
  
  // Calculate center offsets for the grid
  const rowOffset = (dimensions.rows - 1) / 2;
  const colOffset = (dimensions.cols - 1) / 2;
  
  // Create particle effects when blocks are matched
  useEffect(() => {
    // Если отключены анимации или нет совпадающих блоков, не создаем эффекты
    if (!showAnimations || matchedBlocks.size === 0) return;
    
    // Clear old particles
    if (particlesRef.current) {
      particles.current.forEach(p => {
        if (particlesRef.current) {
          particlesRef.current.remove(p);
        }
      });
      particles.current = [];
    }
    
    // Create new particles for each matched block
    matchedBlocks.forEach(blockKey => {
      const [row, col] = blockKey.split(",").map(Number);
      if (!grid[row] || !grid[row][col]) return;
      
      const block = grid[row][col];
      if (!block) return;
      
      const x = col - colOffset;
      const z = row - rowOffset;
      
      // Create particle system
      const particleCount = 20;
      const particleGeometry = new THREE.BufferGeometry();
      const particlesPosition = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particlesPosition[i3] = x + (Math.random() - 0.5) * 0.3;
        particlesPosition[i3 + 1] = 0 + Math.random() * 0.3;
        particlesPosition[i3 + 2] = z + (Math.random() - 0.5) * 0.3;
      }
      
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlesPosition, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        color: getBlockColor(block.colorIndex),
        size: 0.1,
        transparent: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      
      const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      particleSystem.userData = { 
        velocities: Array.from({ length: particleCount }, () => ({
          x: (Math.random() - 0.5) * 0.05,
          y: Math.random() * 0.1,
          z: (Math.random() - 0.5) * 0.05
        })),
        life: 1.0,
        position: { x, y: 0, z }
      };
      
      if (particlesRef.current) {
        particlesRef.current.add(particleSystem);
        particles.current.push(particleSystem);
      }
    });
  }, [matchedBlocks, grid, dimensions.rows, dimensions.cols, rowOffset, colOffset, showAnimations]);
  
  // Animate particles
  useFrame((_, delta) => {
    particles.current.forEach((particle, index) => {
      if (!particle.userData) return;
      
      // Update life
      particle.userData.life -= delta;
      
      // Remove if life is depleted
      if (particle.userData.life <= 0) {
        if (particlesRef.current) {
          particlesRef.current.remove(particle);
          particles.current.splice(index, 1);
        }
        return;
      }
      
      // Update particle positions
      const positions = particle.geometry.attributes.position;
      const velocities = particle.userData.velocities;
      
      for (let i = 0; i < positions.count; i++) {
        const velocity = velocities[i];
        
        positions.setX(i, positions.getX(i) + velocity.x);
        positions.setY(i, positions.getY(i) + velocity.y);
        positions.setZ(i, positions.getZ(i) + velocity.z);
        
        // Add gravity
        velocity.y -= 0.001;
      }
      
      positions.needsUpdate = true;
      
      // Fade out by reducing opacity
      if (particle.material instanceof THREE.PointsMaterial) {
        particle.material.opacity = particle.userData.life;
      }
    });
  });
  
  return <group ref={particlesRef} />;
}