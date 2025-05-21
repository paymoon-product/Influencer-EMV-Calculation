import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CloudLightning, Settings, BookOpen, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  return (
    <header className="bg-white border-b border-primary-200 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <CloudLightning className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold text-primary-900">Aspire EMV Calculator</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/bulk">
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Bulk Calculation</span>
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <Settings className="h-4 w-4" />
                <span>General</span>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}