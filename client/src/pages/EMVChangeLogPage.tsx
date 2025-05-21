import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Settings, RotateCcw, CloudLightning, Sliders, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type ChangeLogEntry = {
  id: string;
  date: string;
  user: string;
  category: "creator" | "postType" | "topic" | "baseValues" | "customTopic";
  action: "add" | "modify" | "remove" | "reset";
  details: string;
};

export default function EMVChangeLogPage() {
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);

  // Load change log from localStorage
  useEffect(() => {
    const savedChangeLog = localStorage.getItem("emv-change-log");
    if (savedChangeLog) {
      try {
        setChangeLog(JSON.parse(savedChangeLog));
      } catch (error) {
        console.error("Error loading change log:", error);
        setChangeLog([]);
      }
    } else {
      // If no change log exists, create sample entries for demonstration
      const sampleEntries: ChangeLogEntry[] = [
        {
          id: "1",
          date: new Date().toISOString(),
          user: "Admin",
          category: "creator",
          action: "modify",
          details: "Updated nano influencer factor from 0.7 to 0.8"
        },
        {
          id: "2", 
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          user: "Admin",
          category: "topic",
          action: "add",
          details: "Added custom topic 'Sports' with factor 1.2"
        },
        {
          id: "3",
          date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          user: "Admin",
          category: "baseValues",
          action: "reset",
          details: "Reset all base values to defaults"
        }
      ];
      setChangeLog(sampleEntries);
      localStorage.setItem("emv-change-log", JSON.stringify(sampleEntries));
    }
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get appropriate badge color based on action
  const getActionColor = (action: string) => {
    switch (action) {
      case "add":
        return "bg-green-100 text-green-700";
      case "modify":
        return "bg-blue-100 text-blue-700";
      case "remove":
        return "bg-red-100 text-red-700";
      case "reset":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get appropriate category icon and label
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "creator":
        return { 
          label: "Creator Factors",
          icon: <Clock className="h-4 w-4 mr-1" />
        };
      case "postType":
        return { 
          label: "Post Type Factors",
          icon: <Clock className="h-4 w-4 mr-1" />
        };
      case "topic":
        return { 
          label: "Topic Factors",
          icon: <Clock className="h-4 w-4 mr-1" />
        };
      case "baseValues":
        return { 
          label: "Base Values",
          icon: <Settings className="h-4 w-4 mr-1" />
        };
      case "customTopic":
        return { 
          label: "Custom Topic",
          icon: <Clock className="h-4 w-4 mr-1" />
        };
      default:
        return { 
          label: "Other",
          icon: <Clock className="h-4 w-4 mr-1" />
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-primary-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/attached_assets/icon.png" alt="Aspire Logo" className="h-6 w-6" />
            <h1 className="text-xl font-semibold text-primary-900">Aspire EMV Calculator</h1>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="bg-gray-50 py-2 px-6 border-b border-gray-200">
        <div className="container mx-auto flex items-center">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-primary-900 mb-2">Configuration Change History</h2>
                <p className="text-primary-600 mb-4">
                  This log tracks all changes made to EMV calculation factors and settings.
                </p>
              </div>

              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-52">Date & Time</TableHead>
                      <TableHead className="w-32">User</TableHead>
                      <TableHead className="w-48">Category</TableHead>
                      <TableHead className="w-28">Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changeLog.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="align-top font-medium text-gray-700">
                          {formatDate(entry.date)}
                        </TableCell>
                        <TableCell className="align-top">
                          {entry.user}
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="flex items-center">
                            {getCategoryInfo(entry.category).icon}
                            <span>{getCategoryInfo(entry.category).label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getActionColor(entry.action)}`}>
                            {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="align-top">
                          {entry.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}