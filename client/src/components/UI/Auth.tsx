
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect } from "react";
import { Button } from "../ui/button";

export default function Auth() {
  const timeLeft = useBlockGame((state) => state.timeLeft);
  const isAuthenticated = useBlockGame((state) => state.isAuthenticated);
  const score = useBlockGame((state) => state.score);
  const setIsAuthenticated = useBlockGame((state) => state.setIsAuthenticated);

  const setUsername = useBlockGame((state) => state.setUsername);
  const syncProgressWithServer = useBlockGame((state) => state.syncProgressWithServer);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (!response.ok) {
          console.error('Auth check failed with status:', response.status);
          return;
        }
        
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUsername(data.user.username);
          
          // После успешной авторизации запускаем синхронизацию данных
          setTimeout(() => {
            syncProgressWithServer();
          }, 500);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, [setIsAuthenticated, setUsername, syncProgressWithServer]);

  if ((timeLeft <= 0 && !isAuthenticated && score > 0) || (!isAuthenticated && window.location.hash === '#login')) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
        <Card className="w-[350px] bg-white shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Авторизация</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-gray-600">
              {score > 0 ? "Войдите чтобы сохранить прогресс" : "Войдите чтобы начать игру"}
            </p>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg"
              onClick={() => {
                const script = document.createElement('script');
                script.src = "https://auth.util.repl.co/script.js";
                script.setAttribute('data-authed', 'window.location.reload()');
                document.body.appendChild(script);
              }}
            >
              Войти через Replit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
