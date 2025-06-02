import { users, foods, userFavorites, type User, type InsertUser, type Food, type InsertFood, type UserFavorite, type InsertUserFavorite, type UserPreferences } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: UserPreferences): Promise<User | undefined>;
  
  getAllFoods(): Promise<Food[]>;
  getFoodById(id: number): Promise<Food | undefined>;
  getFoodsByCuisine(cuisine: string): Promise<Food[]>;
  searchFoods(query: string): Promise<Food[]>;
  getRecommendedFoods(preferences: UserPreferences): Promise<Food[]>;
  
  getUserFavorites(userId: number): Promise<Food[]>;
  addFavorite(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeFavorite(userId: number, foodId: number): Promise<boolean>;
  isFavorite(userId: number, foodId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foods: Map<number, Food>;
  private userFavorites: Map<number, UserFavorite>;
  private currentUserId: number;
  private currentFoodId: number;
  private currentFavoriteId: number;

  constructor() {
    this.users = new Map();
    this.foods = new Map();
    this.userFavorites = new Map();
    this.currentUserId = 1;
    this.currentFoodId = 1;
    this.currentFavoriteId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed foods data
    const seedFoods: InsertFood[] = [
      {
        name: "Grilled Salmon with Herbs",
        description: "Fresh Atlantic salmon grilled to perfection with Mediterranean herbs and served with roasted vegetables.",
        cuisine: "Mediterranean",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        rating: 48,
        cookTime: 25,
        spiceLevel: 2,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        isKeto: true,
        isLowCarb: true,
        flavors: ["savory"],
        ingredients: ["salmon", "herbs", "vegetables"]
      },
      {
        name: "Thai Green Curry",
        description: "Aromatic green curry with coconut milk, fresh vegetables, and fragrant Thai basil served over jasmine rice.",
        cuisine: "Thai",
        image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        rating: 46,
        cookTime: 30,
        spiceLevel: 4,
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        isKeto: false,
        isLowCarb: false,
        flavors: ["spicy", "savory"],
        ingredients: ["coconut milk", "vegetables", "thai basil", "rice"]
      },
      {
        name: "Pasta Pomodoro",
        description: "Classic Italian pasta with fresh tomatoes, basil, garlic, and extra virgin olive oil. Simple yet perfectly executed.",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        rating: 49,
        cookTime: 20,
        spiceLevel: 1,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        isKeto: false,
        isLowCarb: false,
        flavors: ["savory"],
        ingredients: ["pasta", "tomatoes", "basil", "garlic", "olive oil"]
      },
      {
        name: "Chicken Tikka Masala",
        description: "Tender chicken in a rich, creamy tomato-based sauce with aromatic Indian spices.",
        cuisine: "Indian",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        rating: 47,
        cookTime: 35,
        spiceLevel: 3,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        isKeto: false,
        isLowCarb: false,
        flavors: ["spicy", "savory"],
        ingredients: ["chicken", "tomatoes", "cream", "spices"]
      },
      {
        name: "California Roll",
        description: "Fresh sushi roll with imitation crab, avocado, and cucumber, topped with sesame seeds.",
        cuisine: "Japanese",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        rating: 45,
        cookTime: 15,
        spiceLevel: 1,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        isKeto: true,
        isLowCarb: true,
        flavors: ["savory"],
        ingredients: ["crab", "avocado", "cucumber", "rice", "nori"]
      },
      {
        name: "Beef Tacos",
        description: "Seasoned ground beef in soft tortillas with fresh lettuce, tomatoes, cheese, and sour cream.",
        cuisine: "Mexican",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        rating: 44,
        cookTime: 20,
        spiceLevel: 3,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isKeto: false,
        isLowCarb: false,
        flavors: ["spicy", "savory"],
        ingredients: ["beef", "tortillas", "lettuce", "tomatoes", "cheese"]
      },
      {
        name: "Chocolate Lava Cake",
        description: "Decadent chocolate cake with a molten chocolate center, served with vanilla ice cream.",
        cuisine: "French",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        rating: 49,
        cookTime: 25,
        spiceLevel: 1,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        isKeto: false,
        isLowCarb: false,
        flavors: ["sweet"],
        ingredients: ["chocolate", "flour", "eggs", "butter", "sugar"]
      },
      {
        name: "Avocado Toast",
        description: "Fresh avocado mashed on toasted sourdough bread with lime, salt, and chili flakes.",
        cuisine: "American",
        image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        rating: 42,
        cookTime: 10,
        spiceLevel: 1,
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: false,
        isKeto: false,
        isLowCarb: false,
        flavors: ["savory"],
        ingredients: ["avocado", "bread", "lime", "salt", "chili flakes"]
      }
    ];

    seedFoods.forEach(food => {
      const id = this.currentFoodId++;
      this.foods.set(id, { ...food, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserPreferences(userId: number, preferences: UserPreferences): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, preferences };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllFoods(): Promise<Food[]> {
    return Array.from(this.foods.values());
  }

  async getFoodById(id: number): Promise<Food | undefined> {
    return this.foods.get(id);
  }

  async getFoodsByCuisine(cuisine: string): Promise<Food[]> {
    return Array.from(this.foods.values()).filter(food => 
      food.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
  }

  async searchFoods(query: string): Promise<Food[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.foods.values()).filter(food =>
      food.name.toLowerCase().includes(lowerQuery) ||
      food.description.toLowerCase().includes(lowerQuery) ||
      food.cuisine.toLowerCase().includes(lowerQuery) ||
      food.ingredients.some(ingredient => ingredient.toLowerCase().includes(lowerQuery))
    );
  }

  async getRecommendedFoods(preferences: UserPreferences): Promise<Food[]> {
    const allFoods = Array.from(this.foods.values());
    
    return allFoods.filter(food => {
      // Filter by dietary preferences
      if (preferences.dietary.includes("vegetarian") && !food.isVegetarian) return false;
      if (preferences.dietary.includes("vegan") && !food.isVegan) return false;
      if (preferences.dietary.includes("glutenFree") && !food.isGlutenFree) return false;
      if (preferences.dietary.includes("keto") && !food.isKeto) return false;
      if (preferences.dietary.includes("lowCarb") && !food.isLowCarb) return false;
      
      // Filter by cuisine preferences
      if (preferences.cuisines.length > 0 && !preferences.cuisines.includes(food.cuisine)) return false;
      
      // Filter by spice level (within 1 level of preference)
      if (Math.abs(food.spiceLevel - preferences.spiceLevel) > 1) return false;
      
      // Filter by flavor preferences
      if (preferences.flavors.length > 0) {
        const hasMatchingFlavor = preferences.flavors.some(flavor => 
          food.flavors.includes(flavor)
        );
        if (!hasMatchingFlavor) return false;
      }
      
      return true;
    }).sort((a, b) => b.rating - a.rating);
  }

  async getUserFavorites(userId: number): Promise<Food[]> {
    const userFavoriteIds = Array.from(this.userFavorites.values())
      .filter(fav => fav.userId === userId)
      .map(fav => fav.foodId);
    
    return userFavoriteIds
      .map(id => this.foods.get(id))
      .filter(food => food !== undefined) as Food[];
  }

  async addFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    const id = this.currentFavoriteId++;
    const newFavorite: UserFavorite = { ...favorite, id };
    this.userFavorites.set(id, newFavorite);
    return newFavorite;
  }

  async removeFavorite(userId: number, foodId: number): Promise<boolean> {
    const favoriteEntry = Array.from(this.userFavorites.entries()).find(([_, fav]) => 
      fav.userId === userId && fav.foodId === foodId
    );
    
    if (favoriteEntry) {
      this.userFavorites.delete(favoriteEntry[0]);
      return true;
    }
    
    return false;
  }

  async isFavorite(userId: number, foodId: number): Promise<boolean> {
    return Array.from(this.userFavorites.values()).some(fav => 
      fav.userId === userId && fav.foodId === foodId
    );
  }
}

export const storage = new MemStorage();
