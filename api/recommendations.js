// Serverless function for Vercel to handle recommendations
export default async function handler(req, res) {
  // Set CORS headers for API requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Log the incoming request body for debugging
    console.log("Received preferences:", JSON.stringify(req.body));
    
    // Extract preferences from request body with defaults
    const preferences = req.body || {};
    const dietary = Array.isArray(preferences.dietary) ? preferences.dietary : [];
    const cuisines = Array.isArray(preferences.cuisines) ? preferences.cuisines : [];
    const spiceLevel = typeof preferences.spiceLevel === 'number' ? preferences.spiceLevel : 3;
    const flavors = Array.isArray(preferences.flavors) ? preferences.flavors : [];
    
    // Mock food data
    const foods = [
      {
        id: 1,
        name: "Margherita Pizza",
        description: "Classic Italian pizza with tomato sauce, mozzarella, and basil.",
        cuisine: "Italian",
        image: "https://images.unsplash.com/photo-1598023696416-0193a0bcd302?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        rating: 46,
        cookTime: 25,
        spiceLevel: 1,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        isKeto: false,
        isLowCarb: false,
        flavors: ["savory"],
        ingredients: ["flour", "tomatoes", "mozzarella", "basil", "olive oil"]
      },
      {
        id: 2,
        name: "Chicken Tikka Masala",
        description: "Grilled chicken chunks in a creamy spiced tomato sauce.",
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
        id: 3,
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
        id: 4,
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
        id: 5,
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
        id: 6,
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
    
    // Simple filtering logic
    const recommendations = foods.filter(food => {
      // Filter by dietary preferences
      if (dietary.includes("vegetarian") && !food.isVegetarian) return false;
      if (dietary.includes("vegan") && !food.isVegan) return false;
      if (dietary.includes("glutenFree") && !food.isGlutenFree) return false;
      if (dietary.includes("keto") && !food.isKeto) return false;
      if (dietary.includes("lowCarb") && !food.isLowCarb) return false;
      
      // Filter by cuisine preferences
      if (cuisines.length > 0 && !cuisines.includes(food.cuisine)) return false;
      
      // Filter by spice level (within 1 level of preference)
      if (Math.abs(food.spiceLevel - spiceLevel) > 1) return false;
      
      // Filter by flavor preferences
      if (flavors.length > 0) {
        const hasMatchingFlavor = flavors.some(flavor => 
          food.flavors.includes(flavor)
        );
        if (!hasMatchingFlavor) return false;
      }
      
      return true;
    }).sort((a, b) => b.rating - a.rating);
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error in recommendations API:", error);
    res.status(500).json({ 
      message: "Failed to get recommendations",
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
} 