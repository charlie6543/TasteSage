import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Utensils, Heart, Search, Settings } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Discover", icon: Search },
    { path: "/favorites", label: "My Favorites", icon: Heart },
    { path: "/preferences", label: "Preferences", icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Utensils className="text-white text-sm" />
            </div>
            <h1 className="text-xl font-poppins font-bold text-foreground">FlavorFinder</h1>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <Button
                  variant={location === path ? "default" : "ghost"}
                  className={`transition-colors duration-200 ${
                    location === path
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
          
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Utensils className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
