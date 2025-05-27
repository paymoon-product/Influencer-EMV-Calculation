import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CloudLightning, Settings, BookOpen, Clock, Sliders, Sparkles, Target } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-white shadow-lg">
              <Sliders className="h-4 w-4" />
              <span>Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="/settings" className="flex items-center w-full">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/reference" className="flex items-center w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>EMV Reference Guide</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/changelog" className="flex items-center w-full">
                <Clock className="h-4 w-4 mr-2" />
                <span>Change Log</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/insights" className="flex items-center w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>AI Insights</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/benchmarks" className="flex items-center w-full">
                <Target className="h-4 w-4 mr-2" />
                <span>Performance Benchmarks</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {children}
    </div>
  );
}