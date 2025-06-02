import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FoodCard } from "@/components/food-card";
import { CuisineCard } from "@/components/cuisine-card";
import { Search, Sparkles, Play, Globe, Flame, Leaf, Clock, Heart } from "lucide-react";
import { CUISINES } from "@/lib/constants";
import type { Food } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: foods, isLoading } = useQuery<Food[]>({
    queryKey: ["/api/foods"],
  });

  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<Food[]>({
    queryKey: ["/api/recommendations"],
    queryFn: async () => {
      // Get preferences from localStorage or use defaults
      const savedPreferences = localStorage.getItem('userPreferences');
      let preferences = {
        dietary: [],
        cuisines: [],
        spiceLevel: 3,
        flavors: []
      };
      
      if (savedPreferences) {
        try {
          preferences = { ...preferences, ...JSON.parse(savedPreferences) };
        } catch (error) {
          console.error("Error parsing saved preferences:", error);
        }
      }
      
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
  });

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    // This would typically navigate to search results page
    // For now, we'll just update the search query
    setSearchQuery(query);
  };

  const handleCuisineClick = (cuisine: string) => {
    // This would typically filter foods by cuisine
    setActiveFilter(cuisine.toLowerCase());
  };

  const filterButtons = [
    { id: "all", label: "All Cuisines", icon: Globe },
    { id: "spicy", label: "Spicy", icon: Flame },
    { id: "vegetarian", label: "Vegetarian", icon: Leaf },
    { id: "quick", label: "Quick (< 30min)", icon: Clock },
    { id: "healthy", label: "Healthy", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-foreground mb-6">
              Discover Your Next<br />
              <span className="text-primary">Favorite Dish</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Get personalized food recommendations based on your taste preferences, dietary needs, and flavor profiles.
              Let our smart algorithm help you explore new cuisines and dishes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/preferences">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Recommendations
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-poppins font-bold text-foreground mb-4">Explore by Category</h3>
            <p className="text-muted-foreground">Search and filter dishes by cuisine, ingredients, or dietary needs</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for dishes, ingredients, or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg h-14"
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {filterButtons.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeFilter === id ? "default" : "secondary"}
                onClick={() => setActiveFilter(id)}
                className={`transition-colors duration-200 ${
                  activeFilter === id
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary/20 text-foreground hover:bg-secondary/30"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>

          {/* Cuisine Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CUISINES.map((cuisine) => (
              <CuisineCard
                key={cuisine.name}
                name={cuisine.name}
                image={cuisine.image}
                onClick={() => handleCuisineClick(cuisine.name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="py-16 bg-gradient-to-br from-secondary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-3xl font-poppins font-bold text-foreground mb-2">Recommended For You</h3>
              <p className="text-muted-foreground">Based on your taste preferences</p>
            </div>
            <Link href="/search">
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All
                <Search className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoadingRecommendations ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations?.slice(0, 6).map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
