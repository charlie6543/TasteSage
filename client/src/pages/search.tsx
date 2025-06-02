import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FoodCard } from "@/components/food-card";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { CUISINES } from "@/lib/constants";
import type { Food } from "@shared/schema";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: allFoods, isLoading } = useQuery<Food[]>({
    queryKey: ["/api/foods"],
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<Food[]>({
    queryKey: ["/api/foods/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await fetch(`/api/foods/search/${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: !!searchQuery.trim(),
  });

  const { data: cuisineFoods, isLoading: isLoadingCuisine } = useQuery<Food[]>({
    queryKey: ["/api/foods/cuisine", selectedCuisine],
    queryFn: async () => {
      if (selectedCuisine === "all") return [];
      const res = await fetch(`/api/foods/cuisine/${encodeURIComponent(selectedCuisine)}`);
      if (!res.ok) throw new Error("Failed to fetch cuisine foods");
      return res.json();
    },
    enabled: selectedCuisine !== "all",
  });

  const getDisplayedFoods = (): Food[] => {
    if (searchQuery.trim()) {
      return searchResults || [];
    }
    
    if (selectedCuisine !== "all") {
      return cuisineFoods || [];
    }
    
    return allFoods || [];
  };

  const displayedFoods = getDisplayedFoods();
  const isLoadingAny = isLoading || isSearching || isLoadingCuisine;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query when searchQuery changes
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-poppins font-bold text-foreground mb-4">
            Discover Amazing Dishes
          </h1>
          <p className="text-lg text-muted-foreground">
            Search and filter through our collection of delicious recipes
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for dishes, ingredients, or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg h-14"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center space-x-2 flex-1">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cuisines</SelectItem>
                    {CUISINES.map((cuisine) => (
                      <SelectItem key={cuisine.name} value={cuisine.name}>
                        {cuisine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>More Filters</span>
              </Button>
            </div>

            {/* Additional Filters (collapsible) */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Dietary restrictions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="low-carb">Low Carb</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Cooking time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-15">Under 15 min</SelectItem>
                    <SelectItem value="15-30">15-30 min</SelectItem>
                    <SelectItem value="30-60">30-60 min</SelectItem>
                    <SelectItem value="over-60">Over 60 min</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Spice level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="very-hot">Very Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-poppins font-semibold text-foreground">
              {searchQuery ? `Search Results for "${searchQuery}"` : 
               selectedCuisine !== "all" ? `${selectedCuisine} Dishes` : 
               "All Dishes"}
            </h2>
            <span className="text-muted-foreground">
              {isLoadingAny ? "Loading..." : `${displayedFoods.length} dishes found`}
            </span>
          </div>
        </div>

        {/* Food Grid */}
        {isLoadingAny ? (
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
        ) : displayedFoods.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No dishes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
