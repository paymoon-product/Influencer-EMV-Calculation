import { Link, useLocation } from "wouter";
import { Home, Sparkles, Target, Settings, BookOpen, Clock } from "lucide-react";

export function TopNavigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/insights", label: "AI Insights", icon: Sparkles },
    { href: "/benchmarks", label: "Benchmarks", icon: Target },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/reference", label: "Reference", icon: BookOpen },
    { href: "/history", label: "History", icon: Clock },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 py-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary-600 ${
                  isActive 
                    ? "text-primary-600 border-b-2 border-primary-600" 
                    : "text-gray-500"
                }`}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}