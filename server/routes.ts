import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { PlayerProgress, insertUserSchema } from "@shared/schema";
import session from "express-session";
import { z } from "zod";

// Типы для сессии
declare module 'express-session' {
  interface SessionData {
    user: {
      id: number;
      username: string;
    };
  }
}

// Валидация входа
const loginSchema = z.object({
  username: z.string().min(3).max(30).trim(),
  password: z.string().min(3).max(100)
});

// Проверка авторизации
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ success: false, message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Базовая информация о пользователе
  app.get('/api/auth/user', (req, res) => {
    if (req.session && req.session.user) {
      res.json({
        authenticated: true,
        user: {
          id: req.session.user.id,
          username: req.session.user.username
        }
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Регистрация нового пользователя
  app.post('/api/auth/register', async (req, res) => {
    try {
      // Валидация входных данных
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid input data",
          errors: result.error.errors
        });
      }

      // Проверяем, существует ли уже такой пользователь
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists"
        });
      }

      // Создаем пользователя
      const user = await storage.createUser(result.data);

      // Также создаем запись для прогресса игрока
      await storage.createPlayerProgress({
        user_id: user.id,
        high_score: 0,
        max_level: 1,
        total_games: 0,
        stats: {
          allScores: [],
          achievements: []
        }
      });

      // Устанавливаем сессию
      req.session.user = {
        id: user.id,
        username: user.username
      };

      res.json({ 
        success: true,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message === "Username already exists") {
        return res.status(400).json({ 
          success: false, 
          message: "Username already exists"
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Failed to register user"
      });
    }
  });

  // Вход пользователя
  app.post('/api/auth/login', async (req, res) => {
    try {
      // Валидация входных данных
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid login data" 
        });
      }

      const { username, password } = result.data;

      // Проверяем учетные данные
      const user = await storage.validateUser(username, password);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }

      // Устанавливаем сессию
      req.session.user = {
        id: user.id,
        username: user.username
      };

      res.json({ 
        success: true,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      const status = error.status || 500;
      const message = error.message === "Invalid username or password" 
        ? "Неверное имя пользователя или пароль"
        : "Ошибка входа в систему";

      res.status(status).json({ 
        success: false, 
        message
      });
    }
  });

  // Смена пароля
  app.post('/api/auth/change-password', ensureAuthenticated, async (req, res) => {
    try {
      // Валидация входных данных
      const result = z.object({
        currentPassword: z.string().min(3),
        newPassword: z.string().min(3)
      }).safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Некорректные данные"
        });
      }

      const { currentPassword, newPassword } = result.data;
      const userId = req.session.user!.id;

      // Проверяем текущий пароль
      const user = await storage.validateUser(req.session.user!.username, currentPassword);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Неверный текущий пароль"
        });
      }

      // Обновляем пароль
      await storage.updateUserPassword(userId, newPassword);

      res.json({ success: true });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({
        success: false,
        message: "Ошибка при смене пароля"
      });
    }
  });

  // Выход пользователя
  app.post('/api/auth/logout', (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Failed to logout" });
        }
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  // Получить прогресс игрока
  app.get('/api/player/progress', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const progress = await storage.getPlayerProgress(userId);

      if (!progress) {
        return res.status(404).json({ 
          success: false, 
          message: "Player progress not found" 
        });
      }

      res.json({ 
        success: true,
        progress
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to get player progress" 
      });
    }
  });

  // Обновить прогресс игрока
  app.post('/api/player/progress', ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      let progress = await storage.getPlayerProgress(userId);
      
      // Получаем данные от клиента
      const clientData = {
        high_score: req.body.high_score || 0,
        max_level: req.body.max_level || 1,
        total_games: req.body.total_games || 0,
        stats: req.body.stats || {
          allScores: [],
          achievements: []
        }
      };
      
      // Преобразуем дату последней синхронизации от клиента
      const clientLastSync = new Date(req.body.last_synced || 0);
      
      // Логика разрешения конфликтов
      if (!progress) {
        // Если прогресса нет, создаем новый с данными от клиента
        console.log("Создание нового прогресса для пользователя:", userId);
        progress = await storage.createPlayerProgress({
          user_id: userId,
          high_score: clientData.high_score,
          max_level: clientData.max_level,
          total_games: clientData.total_games,
          stats: clientData.stats
        });
        
        return res.json({ 
          success: true,
          progress,
          action: 'client_sync'
        });
      }
      
      // Если серверные данные новее, отправляем их клиенту
      if (progress.last_synced > clientLastSync) {
        console.log("Серверные данные новее, отправляем клиенту:", userId);
        return res.json({ 
          success: true,
          progress,
          action: 'server_sync'
        });
      }
      
      // Если клиентские данные новее или имеют более высокие значения,
      // обновляем серверные данные
      const needsUpdate = 
        clientData.high_score > (progress.high_score || 0) ||
        clientData.max_level > (progress.max_level || 1) ||
        clientData.total_games > (progress.total_games || 0);
      
      if (needsUpdate) {
        console.log("Обновление прогресса для пользователя:", userId);
        // Берем максимальные значения между клиентом и сервером
        const updatedData = {
          high_score: Math.max(clientData.high_score, progress.high_score || 0),
          max_level: Math.max(clientData.max_level, progress.max_level || 1),
          total_games: Math.max(clientData.total_games, progress.total_games || 0),
          stats: {
            // Объединяем массивы очков, если есть, сохраняя последние 10
            allScores: [
              ...(progress.stats?.allScores || []),
              ...(clientData.stats?.allScores || [])
            ].slice(-10),
            achievements: [
              ...(progress.stats?.achievements || []),
              ...(clientData.stats?.achievements || [])
            ]
          },
          last_synced: new Date()
        };
        
        progress = await storage.updatePlayerProgress(userId, updatedData) as PlayerProgress;
        
        return res.json({ 
          success: true,
          progress,
          action: 'client_sync'
        });
      }
      
      // Если никаких обновлений не требуется, просто обновляем временную метку
      // и возвращаем текущий прогресс
      progress = await storage.updatePlayerProgress(userId, {
        last_synced: new Date()
      }) as PlayerProgress;
      
      return res.json({ 
        success: true,
        progress,
        action: 'no_changes'
      });
      
    } catch (error: any) {
      console.error("Ошибка при обновлении прогресса:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to update player progress" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}