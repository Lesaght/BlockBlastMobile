import { users, playerProgress, type User, type InsertUser, type PlayerProgress, type InsertProgress, type UpdateProgress } from "@shared/schema";
import bcrypt from 'bcryptjs';

// Интерфейс для управления пользователями и прогрессом
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;

  // Player progress methods
  getPlayerProgress(userId: number): Promise<PlayerProgress | undefined>;
  createPlayerProgress(progress: InsertProgress): Promise<PlayerProgress>;
  updatePlayerProgress(userId: number, progress: UpdateProgress): Promise<PlayerProgress | undefined>;
}

// В памяти хранящий класс для тестирования
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private progress: Map<number, PlayerProgress>;
  private userId: number;
  private progressId: number;

  constructor() {
    this.users = new Map();
    this.progress = new Map();
    this.userId = 1;
    this.progressId = 1;

    // Добавим тестового пользователя
    this.createUser({
      username: 'test',
      password: 'password'
    }).then(user => {
      this.createPlayerProgress({
        user_id: user.id,
        high_score: 750,
        max_level: 3,
        total_games: 5,
        stats: {
          allScores: [400, 520, 750, 320, 490],
          achievements: []
        }
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Проверяем, что пользователь с таким именем не существует
    const existingUser = await this.getUserByUsername(insertUser.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);

    // Создаем нового пользователя
    const id = this.userId++;
    const created_at = new Date();
    const user: User = { ...insertUser, password: hashedPassword, id, created_at };
    this.users.set(id, user);

    return user;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, password: hashedPassword };
    this.users.set(userId, updatedUser);
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Player progress methods
  async getPlayerProgress(userId: number): Promise<PlayerProgress | undefined> {
    // Ищем прогресс по ID пользователя
    return Array.from(this.progress.values()).find(
      (progress) => progress.user_id === userId,
    );
  }

  async createPlayerProgress(insertProgress: InsertProgress): Promise<PlayerProgress> {
    const id = this.progressId++;
    const now = new Date();

    const progress: PlayerProgress = {
      ...insertProgress,
      id,
      high_score: insertProgress.high_score ?? 0, 
      max_level: insertProgress.max_level ?? 1,
      total_games: insertProgress.total_games ?? 0,
      stats: insertProgress.stats ?? {
        allScores: [],
        achievements: []
      },
      last_played: now,
      updated_at: now,
      last_synced: now
    };

    this.progress.set(id, progress);
    return progress;
  }

  async updatePlayerProgress(userId: number, updateData: UpdateProgress): Promise<PlayerProgress | undefined> {
    // Находим существующий прогресс
    const currentProgress = await this.getPlayerProgress(userId);
    if (!currentProgress) return undefined;

    // Обновляем данные с проверкой типов
    const updated: PlayerProgress = {
      ...currentProgress,
      high_score: updateData.high_score ?? currentProgress.high_score,
      max_level: updateData.max_level ?? currentProgress.max_level,
      total_games: updateData.total_games ?? currentProgress.total_games,
      stats: updateData.stats ?? currentProgress.stats,
      last_played: new Date(),
      updated_at: new Date(),
      last_synced: new Date()
    };

    // Сохраняем обновленный прогресс
    this.progress.set(currentProgress.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();