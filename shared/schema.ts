import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  preferences: jsonb("preferences").$type<UserPreferences>(),
});

export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cuisine: text("cuisine").notNull(),
  image: text("image").notNull(),
  rating: integer("rating").notNull(),
  cookTime: integer("cook_time").notNull(),
  spiceLevel: integer("spice_level").notNull(),
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  isVegan: boolean("is_vegan").notNull().default(false),
  isGlutenFree: boolean("is_gluten_free").notNull().default(false),
  isKeto: boolean("is_keto").notNull().default(false),
  isLowCarb: boolean("is_low_carb").notNull().default(false),
  flavors: text("flavors").array().notNull(),
  ingredients: text("ingredients").array().notNull(),
});

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  foodId: integer("food_id").notNull(),
});

export const userPreferencesSchema = z.object({
  dietary: z.array(z.enum(["vegetarian", "vegan", "glutenFree", "keto", "lowCarb"])).default([]),
  cuisines: z.array(z.string()).default([]),
  spiceLevel: z.number().min(1).max(5).default(3),
  flavors: z.array(z.enum(["sweet", "savory", "tangy", "spicy"])).default([]),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertFoodSchema = createInsertSchema(foods).omit({
  id: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;
export type Food = typeof foods.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
