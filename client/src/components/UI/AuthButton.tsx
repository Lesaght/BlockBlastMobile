import { useState } from 'react';
import { useBlockGame } from "@/lib/stores/useBlockGame";
import AuthModal from "./auth/AuthModal";
import AccountMenu from "./AccountMenu";

export default function AuthButton() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isAuthenticated = useBlockGame((state) => state.isAuthenticated);
  const username = useBlockGame((state) => state.username);

  if (isAuthenticated && username) {
    return <AccountMenu />;
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Авторизация"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/>
          <path d="M3 20c0-3.87 3.13-7 7-7h4c3.87 0 7 3.13 7 7"/>
        </svg>
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}