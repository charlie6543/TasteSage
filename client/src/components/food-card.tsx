import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Food } from "@shared/schema";

interface FoodCardProps {
  food: Food;
}

export function FoodCard({ food }: FoodCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favoriteStatus } = useQuery({
    queryKey: ["/api/favorites", food.id, "check"],
    queryFn: async () => {
      const res = await fetch(`/api/favorites/${food.id}/check`);
      return res.json();
    },
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/favorites", { foodId: food.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", food.id, "check"] });
      toast({
        title: "Added to favorites!",
        description: `${food.name} has been added to your favorites.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/favorites/${food.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", food.id, "check"] });
      toast({
        title: "Removed from favorites",
        description: `${food.name} has been removed from your favorites.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = () => {
    if (favoriteStatus?.isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating / 10);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i < fullStars ? "fill-current text-accent" : "text-gray-300"}`}
        />
      );
    }
    
    return stars;
  };

  const getCuisineColor = (cuisine: string) => {
    const colors = {
      Mediterranean: "bg-secondary/20 text-secondary",
      Thai: "bg-primary/20 text-primary",
      Italian: "bg-accent/20 text-orange-600",
      Indian: "bg-purple-100 text-purple-700",
      Japanese: "bg-blue-100 text-blue-700",
      Mexican: "bg-red-100 text-red-700",
      French: "bg-pink-100 text-pink-700",
      American: "bg-green-100 text-green-700",
    };
    
    return colors[cuisine as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <Card className="food-card">
      <div className="relative">
        <img
          src={food.image}
          alt={food.name}
          className="food-card-image"
        />
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-3 right-3 ${
            favoriteStatus?.isFavorite ? "text-red-500" : "text-white"
          } hover:scale-110 transition-all duration-200`}
          onClick={handleFavoriteToggle}
          disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
        >
          <Heart className={`w-5 h-5 ${favoriteStatus?.isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge className={`cuisine-tag ${getCuisineColor(food.cuisine)}`}>
            {food.cuisine}
          </Badge>
        </div>
        
        <h4 className="text-xl font-poppins font-semibold text-foreground mb-2">
          {food.name}
        </h4>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {food.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="star-rating">
              {renderStars(food.rating)}
            </div>
            <span className="text-sm text-muted-foreground">
              {(food.rating / 10).toFixed(1)}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{food.cookTime} min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
