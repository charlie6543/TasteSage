import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FoodCard } from "@/components/food-card";
import { Heart, Share2, Plus, Search } from "lucide-react";
import type { Food } from "@shared/schema";

export default function Favorites() {
  const { data: favorites, isLoading } = useQuery<Food[]>({
    queryKey: ["/api/favorites"],
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-poppins font-bold text-foreground mb-2">
              My Favorites
            </h1>
            <p className="text-lg text-muted-foreground">
              Your saved dishes and recipes
            </p>
          </div>
          <Button variant="outline" className="hidden sm:flex items-center">
            <Share2 className="w-4 h-4 mr-2" />
            Share List
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!favorites || favorites.length === 0) && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-poppins font-semibold text-foreground mb-2">
              No favorites yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start exploring dishes and add them to your favorites to see them here. 
              Your favorite recipes will be saved for easy access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Search className="w-5 h-5 mr-2" />
                  Discover Dishes
                </Button>
              </Link>
              <Link href="/preferences">
                <Button variant="outline" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Set Preferences
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Favorites Grid */}
        {!isLoading && favorites && favorites.length > 0 && (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-poppins font-semibold text-foreground">
                  {favorites.length} Saved {favorites.length === 1 ? "Dish" : "Dishes"}
                </h2>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  <Heart className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {favorites.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
              
              {/* Add More Button */}
              <Card className="border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer group">
                <Link href="/search">
                  <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] p-6">
                    <div className="w-16 h-16 bg-gray-100 group-hover:bg-primary/10 rounded-full flex items-center justify-center mb-4 transition-colors duration-200">
                      <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                    </div>
                    <p className="text-center font-medium text-muted-foreground group-hover:text-primary transition-colors duration-200">
                      Discover more dishes to add to your favorites
                    </p>
                  </CardContent>
                </Link>
              </Card>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6">
              <h3 className="text-lg font-poppins font-semibold text-foreground mb-4">
                Your Taste Profile
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {favorites.length}
                  </div>
                  <div className="text-muted-foreground">Saved Dishes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary mb-1">
                    {new Set(favorites.map(f => f.cuisine)).size}
                  </div>
                  <div className="text-muted-foreground">Cuisines</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {Math.round(favorites.reduce((acc, f) => acc + f.rating, 0) / favorites.length / 10 * 10) / 10}
                  </div>
                  <div className="text-muted-foreground">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success mb-1">
                    {Math.round(favorites.reduce((acc, f) => acc + f.cookTime, 0) / favorites.length)}m
                  </div>
                  <div className="text-muted-foreground">Avg Cook Time</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
