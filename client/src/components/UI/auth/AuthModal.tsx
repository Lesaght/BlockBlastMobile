import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

enum AuthView {
  LOGIN = "login",
  REGISTER = "register",
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  showRegisterPrompt?: boolean;
}

export default function AuthModal({ isOpen, onClose, showRegisterPrompt = false }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(showRegisterPrompt ? AuthView.REGISTER : AuthView.LOGIN);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="animate-fade-in-up w-full max-w-md">
        {view === AuthView.LOGIN ? (
          <LoginForm 
            onSuccess={onClose} 
            onSignupClick={() => setView(AuthView.REGISTER)} 
          />
        ) : (
          <RegisterForm 
            onSuccess={onClose} 
            onLoginClick={() => setView(AuthView.LOGIN)} 
          />
        )}
        
        <button 
          className="mt-4 mx-auto block text-gray-400 hover:text-white text-sm"
          onClick={onClose}
        >
          Вернуться без авторизации
        </button>
      </div>
    </div>
  );
}