import { EMVCalculator } from "@/components/EMVCalculator";
import { CloudLightning, Settings, BookOpen, HelpCircle, Clock, User, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EMVBulkCalculationPage from "./EMVBulkCalculationPage";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-primary-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CloudLightning className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-primary-900">Aspire EMV Calculator</h1>
          </div>
          <div className="flex items-center space-x-2">

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

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-900 mb-2">Earned Media Value (EMV) Calculator</h2>
            <p className="text-primary-600">Calculate the monetary impact of organic social media engagement based on our updated EMV framework.</p>
          </div>
          
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="individual" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Individual Input
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Bulk Calculation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual">
              <EMVCalculator />
            </TabsContent>
            
            <TabsContent value="bulk">
              <div className="p-4 border rounded-lg bg-white">
                <EMVBulkCalculationPage />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-white border-t border-primary-200 py-4 px-6">
        <div className="container mx-auto text-center text-primary-500 text-sm">
          © {new Date().getFullYear()} Aspire Influencer Marketing Platform | EMV Calculator
        </div>
      </footer>
    </div>
  );
}
