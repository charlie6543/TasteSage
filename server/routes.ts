import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { userPreferencesSchema, insertUserFavoriteSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default user and seed data if needed
  const initializeUser = async () => {
    try {
      let user = await storage.getUserByUsername("demo_user");
      if (!user) {
        user = await storage.createUser({ username: "demo_user" });
      }
      
      // Check if we need to seed food data
      const foods = await storage.getAllFoods();
      if (foods.length === 0) {
        console.log("Seeding food data...");
        // Use the MemStorage seeding functionality temporarily
        const memStorage = new (await import("./storage")).MemStorage();
        const seedFoods = await memStorage.getAllFoods();
        
        // Insert each food into the database
        for (const food of seedFoods) {
          try {
            await storage.createFood({
              name: food.name,
              description: food.description,
              cuisine: food.cuisine,
              image: food.image,
              rating: food.rating,
              cookTime: food.cookTime,
              spiceLevel: food.spiceLevel,
              isVegetarian: food.isVegetarian,
              isVegan: food.isVegan,
              isGlutenFree: food.isGlutenFree,
              isKeto: food.isKeto,
              isLowCarb: food.isLowCarb,
              flavors: food.flavors,
              ingredients: food.ingredients
            });
          } catch (seedError) {
            console.error("Error seeding food:", food.name, seedError);
          }
        }
        console.log("Food data seeding completed");
      }
      
      return user;
    } catch (error) {
      console.error("Failed to initialize user:", error);
      return null;
    }
  };

  // Get current user
  app.get("/api/user", async (req, res) => {
    try {
      const user = await initializeUser();
      if (!user) {
        return res.status(500).json({ message: "Failed to get user" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Update user preferences
  app.post("/api/user/preferences", async (req, res) => {
    try {
      const preferences = userPreferencesSchema.parse(req.body);
      const user = await initializeUser();
      if (!user) {
        return res.status(500).json({ message: "Failed to get user" });
      }
      
      const updatedUser = await storage.updateUserPreferences(user.id, preferences);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preferences", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Get all foods
  app.get("/api/foods", async (req, res) => {
    try {
      const foods = await storage.getAllFoods();
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch foods" });
    }
  });

  // Get food by ID
  app.get("/api/foods/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const food = await storage.getFoodById(id);
      
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }
      
      res.json(food);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food" });
    }
  });

  // Search foods
  app.get("/api/foods/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const foods = await storage.searchFoods(query);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to search foods" });
    }
  });

  // Get foods by cuisine
  app.get("/api/foods/cuisine/:cuisine", async (req, res) => {
    try {
      const cuisine = req.params.cuisine;
      const foods = await storage.getFoodsByCuisine(cuisine);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch foods by cuisine" });
    }
  });

  // Get recommendations based on preferences
  app.post("/api/recommendations", async (req, res) => {
    try {
      const preferences = userPreferencesSchema.parse(req.body);
      const recommendations = await storage.getRecommendedFoods(preferences);
      res.json(recommendations);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preferences", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  // Get user favorites (mock user ID for demo)
  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add to favorites
  app.post("/api/favorites", async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const { foodId } = req.body;
      
      if (!foodId) {
        return res.status(400).json({ message: "Food ID is required" });
      }

      // Check if already favorited
      const isAlreadyFavorite = await storage.isFavorite(userId, foodId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ message: "Food is already in favorites" });
      }

      const favorite = await storage.addFavorite({ userId, foodId });
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  // Remove from favorites
  app.delete("/api/favorites/:foodId", async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const foodId = parseInt(req.params.foodId);
      
      const removed = await storage.removeFavorite(userId, foodId);
      
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Check if food is favorite
  app.get("/api/favorites/:foodId/check", async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const foodId = parseInt(req.params.foodId);
      
      const isFavorite = await storage.isFavorite(userId, foodId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
