
import { useState } from "react";
import { useBlockGame } from "@/lib/stores/useBlockGame";
import { useAudio } from "@/lib/stores/useAudio";
import { useDisplaySettings } from "@/lib/stores/useDisplaySettings";
import { ProfilePage } from "./ProfilePage";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Trophy, Settings, Volume2, Monitor } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export default function AccountMenu() {
  const [showProfile, setShowProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const username = useBlockGame((state) => state.username);
  const logout = useBlockGame((state) => state.logout);
  const highScore = useBlockGame((state) => state.highScore);
  
  // Аудио настройки
  const isMuted = useAudio((state) => state.isMuted);
  const toggleMute = useAudio((state) => state.toggleMute);
  
  // Настройки отображения
  const showAnimations = useDisplaySettings((state) => state.showAnimations);
  const showHints = useDisplaySettings((state) => state.showHints);
  const toggleAnimations = useDisplaySettings((state) => state.toggleAnimations);
  const toggleHints = useDisplaySettings((state) => state.toggleHints);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        alert('Пароль успешно изменен');
      } else {
        setError(data.message || 'Ошибка при смене пароля');
      }
    } catch (err) {
      setError('Ошибка сервера');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]">
        <Avatar className="h-8 w-8 bg-blue-800 ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
          <AvatarFallback className="bg-blue-800 text-white font-medium">
            {username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium tracking-wide">{username}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 bg-gray-900/95 backdrop-blur-sm border-gray-800 text-white" align="end">
        <DropdownMenuItem 
          className="flex items-center gap-2 text-gray-200 hover:text-white focus:text-white hover:bg-gray-800/50 cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            setShowProfile(true);
          }}
        >
          <User size={16} />
          <span>Профиль</span>
        </DropdownMenuItem>
        
        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
            <ProfilePage />
          </DialogContent>
        </Dialog>

        <DropdownMenuSeparator className="bg-gray-800" />
        
        <DropdownMenuItem className="flex items-center gap-2 text-gray-300 hover:text-white focus:text-white hover:bg-gray-800/50 cursor-pointer">
          <Trophy size={16} className="text-yellow-500" />
          <span>Рекорд: {highScore}</span>
        </DropdownMenuItem>

        <Dialog onOpenChange={(open) => {
          if (!open) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError(null);
          }
        }}>
          <DialogTrigger asChild>
            <DropdownMenuItem 
              className="flex items-center gap-2 text-gray-300 hover:text-white focus:text-white hover:bg-gray-800/50 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <Settings size={16} className="text-gray-400" />
              <span>Настройки</span>
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Настройки</DialogTitle>
            </DialogHeader>

            <div className="space-y-8 py-4">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2 flex items-center gap-2">
                  <User size={20} className="text-blue-400" />
                  Аккаунт
                </h3>
                <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Текущий пароль</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Введите текущий пароль"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Новый пароль</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Введите новый пароль"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Подтвердите новый пароль</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Повторите новый пароль"
                    />
                  </div>
                  {error && (
                    <div className="text-red-400 text-sm bg-red-950/50 p-2 rounded border border-red-900/50">
                      {error}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-700/50">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-gray-800"
                      onClick={() => {
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setError(null);
                      }}
                    >
                      Сбросить
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handlePasswordChange}
                      disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                    >
                      {isLoading ? 'Сохранение...' : 'Сменить пароль'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2 flex items-center gap-2">
                  <Volume2 size={20} className="text-green-400" />
                  Звук
                </h3>
                <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between group">
                    <div>
                      <label className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Звук</label>
                      <p className="text-xs text-gray-500">Все звуки и музыка в игре</p>
                    </div>
                    <Switch 
                      checked={!isMuted} 
                      onCheckedChange={() => toggleMute()} 
                      className="data-[state=checked]:bg-green-500" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white border-b border-gray-700/50 pb-2 flex items-center gap-2">
                  <Monitor size={20} className="text-purple-400" />
                  Отображение
                </h3>
                <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between group">
                    <div>
                      <label className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Анимации</label>
                      <p className="text-xs text-gray-500">Эффекты при уничтожении блоков</p>
                    </div>
                    <Switch 
                      checked={showAnimations} 
                      onCheckedChange={toggleAnimations} 
                      className="data-[state=checked]:bg-purple-500" 
                    />
                  </div>
                  <div className="flex items-center justify-between group">
                    <div>
                      <label className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Подсказки</label>
                      <p className="text-xs text-gray-500">Показывать возможные ходы</p>
                    </div>
                    <Switch 
                      checked={showHints}
                      onCheckedChange={toggleHints}
                      className="data-[state=checked]:bg-purple-500" 
                    />
                  </div>
                </div>
              </div>



              <DialogFooter className="gap-2 pt-4">
                <Button 
                  variant="ghost" 
                  className="hover:bg-gray-800"
                >
                  Закрыть
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenuSeparator className="bg-gray-800" />
        
        <DropdownMenuItem 
          onClick={logout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-red-950/30 focus:bg-red-950/30 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Выйти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
