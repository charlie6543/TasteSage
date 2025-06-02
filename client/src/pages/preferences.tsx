import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Leaf, Globe, Flame, Check } from "lucide-react";
import { DIETARY_OPTIONS, FLAVOR_OPTIONS, CUISINES } from "@/lib/constants";
import type { UserPreferences } from "@shared/schema";

export default function Preferences() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [preferences, setPreferences] = useState<UserPreferences>({
    dietary: [],
    cuisines: [],
    spiceLevel: 3,
    flavors: []
  });

  // Load user preferences from database
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  // Update local preferences when user data loads
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  const savePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: UserPreferences) => {
      // Save preferences to the database
      return apiRequest("POST", "/api/user/preferences", newPreferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Preferences saved!",
        description: "Your taste preferences have been updated. Getting new recommendations...",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDietaryChange = (dietaryId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      dietary: checked 
        ? [...prev.dietary, dietaryId as any]
        : prev.dietary.filter(d => d !== dietaryId)
    }));
  };

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      cuisines: checked
        ? [...prev.cuisines, cuisine]
        : prev.cuisines.filter(c => c !== cuisine)
    }));
  };

  const handleFlavorChange = (flavor: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      flavors: checked
        ? [...prev.flavors, flavor as any]
        : prev.flavors.filter(f => f !== flavor)
    }));
  };

  const handleSpiceLevelChange = (value: number[]) => {
    setPreferences(prev => ({
      ...prev,
      spiceLevel: value[0]
    }));
  };

  const handleSavePreferences = () => {
    savePreferencesMutation.mutate(preferences);
  };

  const getSpiceLevelLabel = (level: number) => {
    const labels = ["", "Mild", "Light", "Medium", "Hot", "Very Hot"];
    return labels[level] || "Medium";
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-poppins font-bold text-foreground mb-4">
            Set Your Taste Preferences
          </h1>
          <p className="text-lg text-muted-foreground">
            Tell us about your preferences to get personalized food recommendations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Dietary Preferences */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Leaf className="w-5 h-5 mr-2 text-success" />
                Dietary Needs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DIETARY_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={option.id}
                    checked={preferences.dietary.includes(option.id as any)}
                    onCheckedChange={(checked) => 
                      handleDietaryChange(option.id, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={option.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center"
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cuisine Preferences */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Globe className="w-5 h-5 mr-2 text-accent" />
                Favorite Cuisines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {CUISINES.map((cuisine) => (
                <div key={cuisine.name} className="flex items-center space-x-3">
                  <Checkbox
                    id={cuisine.name}
                    checked={preferences.cuisines.includes(cuisine.name)}
                    onCheckedChange={(checked) => 
                      handleCuisineChange(cuisine.name, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={cuisine.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {cuisine.name}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Flavor Profile */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Flame className="w-5 h-5 mr-2 text-primary" />
                Flavor Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  Spice Level: <Badge variant="secondary">{getSpiceLevelLabel(preferences.spiceLevel)}</Badge>
                </label>
                <Slider
                  value={[preferences.spiceLevel]}
                  onValueChange={handleSpiceLevelChange}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Mild</span>
                  <span>Medium</span>
                  <span>Spicy</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Preferred Flavors
                </label>
                {FLAVOR_OPTIONS.map((flavor) => (
                  <div key={flavor.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={flavor.id}
                      checked={preferences.flavors.includes(flavor.id as any)}
                      onCheckedChange={(checked) => 
                        handleFlavorChange(flavor.id, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={flavor.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center"
                    >
                      <span className="mr-2">{flavor.icon}</span>
                      {flavor.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 mb-8">
          <CardContent className="pt-6">
            <h3 className="text-lg font-poppins font-semibold text-foreground mb-4">
              Your Preference Summary
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Dietary:</span>
                <div className="mt-1 space-y-1">
                  {preferences.dietary.length > 0 ? (
                    preferences.dietary.map(d => (
                      <Badge key={d} variant="secondary" className="mr-1 mb-1">
                        {DIETARY_OPTIONS.find(opt => opt.id === d)?.label}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">None selected</span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Cuisines:</span>
                <div className="mt-1 space-y-1">
                  {preferences.cuisines.length > 0 ? (
                    preferences.cuisines.map(c => (
                      <Badge key={c} variant="secondary" className="mr-1 mb-1">
                        {c}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">All cuisines</span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Spice Level:</span>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {getSpiceLevelLabel(preferences.spiceLevel)}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Flavors:</span>
                <div className="mt-1 space-y-1">
                  {preferences.flavors.length > 0 ? (
                    preferences.flavors.map(f => (
                      <Badge key={f} variant="secondary" className="mr-1 mb-1">
                        {FLAVOR_OPTIONS.find(opt => opt.id === f)?.label}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">All flavors</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleSavePreferences}
            disabled={savePreferencesMutation.isPending}
            className="bg-success text-white hover:bg-success/90 px-8 py-3"
          >
            <Check className="w-5 h-5 mr-2" />
            {savePreferencesMutation.isPending ? "Saving..." : "Save Preferences & Get Recommendations"}
          </Button>
        </div>
      </div>
    </div>
  );
}
