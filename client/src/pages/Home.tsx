import { EMVCalculator } from "@/components/EMVCalculator";
import { User, Users, Sparkles, Target, CloudLightning, Settings, BookOpen, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/MainLayout";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Home() {
  return (
    <MainLayout>
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-primary-900 mb-2">Earned Media Value (EMV) Calculator</h2>
                <p className="text-primary-600">Calculate the monetary impact of organic social media engagement based on our updated EMV framework.</p>
              </div>
              <div className="flex space-x-3">
                <Link href="/insights">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Insights</span>
                  </Button>
                </Link>
                <Link href="/benchmarks">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Benchmarks</span>
                  </Button>
                </Link>
              </div>
            </div>
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
                <div className="flex flex-col">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-primary-900 mb-2">Bulk EMV Calculation</h2>
                    <p className="text-gray-600">Upload a CSV file with multiple creators to calculate EMV in bulk.</p>
                  </div>
                  
                  <Button asChild className="w-fit mb-6">
                    <Link href="/bulk">
                      <Users className="h-4 w-4 mr-2" />
                      Go to Bulk Calculator
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </MainLayout>
  );
}
