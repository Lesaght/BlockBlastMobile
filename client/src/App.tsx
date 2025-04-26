import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { useBlockGame } from "./lib/stores/useBlockGame";
import { useDisplaySettings } from "./lib/stores/useDisplaySettings";
import { apiRequest } from "./lib/queryClient";
import "@fontsource/inter";
import Game from "./components/Game";
import { Loader } from "@/components/UI/Loader";
import UI from "@/components/UI";

// Define control keys for the game
const controls = [
  { name: "select", keys: ["Space", "KeyE"] },
  { name: "restart", keys: ["KeyR"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "up", keys: ["ArrowUp", "KeyW"] },
  { name: "down", keys: ["ArrowDown", "KeyS"] },
];

function App() {
  // Initialize audio
  const setBackgroundMusic = useAudio((state) => state.setBackgroundMusic);
  const setHitSound = useAudio((state) => state.setHitSound);
  const setSuccessSound = useAudio((state) => state.setSuccessSound);
  const toggleMute = useAudio((state) => state.toggleMute);
  const initAudioSettings = useAudio((state) => state.initFromLocalStorage);
  
  // Initialize display settings
  const initDisplaySettings = useDisplaySettings((state) => state.initFromLocalStorage);
  
  // Auth state
  const setIsAuthenticated = useBlockGame((state) => state.setIsAuthenticated);
  const setUsername = useBlockGame((state) => state.setUsername);

  // Инициализируем настройки из localStorage
  useEffect(() => {
    // Загружаем сохраненные настройки
    initAudioSettings();
    initDisplaySettings();
  }, [initAudioSettings, initDisplaySettings]);

  // Check for existing session
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiRequest({
          url: "/api/auth/user",
          method: "GET",
          on401: "returnNull"
        });
        
        if (response && response.authenticated) {
          setIsAuthenticated(true);
          setUsername(response.user.username);
          console.log("User authenticated:", response.user.username);
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
      }
    };
    
    checkAuthStatus();
  }, [setIsAuthenticated, setUsername]);

  // Load audio assets
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    setBackgroundMusic(bgMusic);

    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.7;
    setSuccessSound(success);

    // Auto-start with audio muted (to comply with browser policies)
    // User can unmute by clicking the sound button
    toggleMute();
    console.log("Sound unmuted");

    // Cleanup
    return () => {
      bgMusic.pause();
      hit.pause();
      success.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound, toggleMute]);

  return (
    <KeyboardControls map={controls}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{
          position: [0, 8, 10],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          powerPreference: "default"
        }}
      >
        <color attach="background" args={["#1a1a2e"]} />
        
        <Suspense fallback={null}>
          <Game />
        </Suspense>
      </Canvas>
      
      {/* UI Components - Rendered outside of Canvas */}
      <Loader />
      <UI />
    </KeyboardControls>
  );
}

export default App;
