import { useState } from "react";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Loader } from "@/components/UI/Loader";

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick: () => void;
}

export default function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setIsAuthenticated = useBlockGame((state) => state.setIsAuthenticated);
  const setUser = useBlockGame((state) => state.setUsername);
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Проверка паролей
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setUser(data.user.username);
        if (onSuccess) onSuccess();
      } else {
        console.log("Registration failed:", data);
        if (data.message === "Username already exists") {
          setError("Это имя пользователя уже занято. Пожалуйста, выберите другое.");
        } else {
          setError(data.message || "Ошибка при регистрации");
        }
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError("Не удалось зарегистрироваться. Пожалуйста, попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 bg-gray-800 bg-opacity-90 rounded-lg shadow-xl`}>
      <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white text-center mb-4`}>
        Регистрация аккаунта
      </h2>

      {error && (
        <div className="bg-red-900 bg-opacity-60 border border-red-700 text-white px-4 py-2 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-gray-300 text-sm font-medium mb-1">
            Имя пользователя
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Минимум 3 символа"
            required
            minLength={3}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-1">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Минимум 3 символа"
            required
            minLength={3}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-gray-300 text-sm font-medium mb-1">
            Подтвердите пароль
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Повторите пароль"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full ${isMobile ? 'py-2' : 'py-3'} bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
        >
          {isLoading ? <Loader /> : "Создать аккаунт"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-400">
        <p>
          Уже есть аккаунт?{" "}
          <button 
            onClick={onLoginClick}
            className="text-blue-400 hover:underline focus:outline-none"
            disabled={isLoading}
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
}