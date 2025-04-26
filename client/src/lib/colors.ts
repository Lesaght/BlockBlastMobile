import * as THREE from "three";

// Bright and distinct colors for the blocks
const BLOCK_COLORS = [
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#FFC107", // Yellow
  "#F44336", // Red
  "#9C27B0", // Purple
  "#FF9800", // Orange
  "#00BCD4", // Cyan
  "#E91E63", // Pink
];

// Get color based on block's color index
export function getBlockColor(colorIndex: number): string {
  return BLOCK_COLORS[colorIndex % BLOCK_COLORS.length];
}

// Get THREE.Color object (useful for Three.js materials)
export function getThreeColor(colorIndex: number): THREE.Color {
  const colorString = getBlockColor(colorIndex);
  return new THREE.Color(colorString);
}

// Get background color gradient for menus, etc.
export function getBackgroundGradient(): string {
  return "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";
}

// Get color for UI elements
export function getUIColor(variant: 'primary' | 'secondary' | 'accent' = 'primary'): string {
  switch (variant) {
    case 'primary':
      return '#3498db';  // Blue
    case 'secondary':
      return '#2ecc71';  // Green
    case 'accent':
      return '#e74c3c';  // Red
    default:
      return '#3498db';
  }
}
