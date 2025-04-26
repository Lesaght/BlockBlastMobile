import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const playerProgress = pgTable("player_progress", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  high_score: integer("high_score").default(0),
  max_level: integer("max_level").default(1),
  total_games: integer("total_games").default(0),
  last_played: timestamp("last_played").defaultNow(),
  stats: json("stats").$type<{
    allScores: number[];
    achievements: string[];
  }>(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  last_synced: timestamp("last_synced").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProgressSchema = createInsertSchema(playerProgress).pick({
  user_id: true,
  high_score: true,
  max_level: true,
  total_games: true,
  stats: true,
  last_synced: true,
});

export const updateProgressSchema = createInsertSchema(playerProgress).pick({
  high_score: true, 
  max_level: true,
  total_games: true,
  stats: true,
  last_synced: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PlayerProgress = typeof playerProgress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type UpdateProgress = z.infer<typeof updateProgressSchema>;
