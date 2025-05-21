import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, Eye, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { EMVCalculation } from "@/lib/emv-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EMVResults } from "@/components/EMVResults";

export default function EMVHistoryPage() {
  const { toast } = useToast();
  const [calculations, setCalculations] = useState<EMVCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalculation, setSelectedCalculation] = useState<EMVCalculation | null>(null);

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", "/api/emv/history");
        
        if (response.ok) {
          const data = await response.json();
          setCalculations(data.calculations || []);
        } else {
          // Handle unauthorized or error cases
          toast({
            title: "Error",
            description: "Failed to fetch calculation history. Please log in to view your calculations.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch calculation history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCalculations();
  }, [toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleExport = () => {
    if (calculations.length === 0) return;

    // Create CSV content
    const headers = [
      "ID",
      "Date",
      "Platform",
      "Post Type",
      "Creator Size",
      "Content Topic",
      "Total EMV",
    ];

    const rows = calculations.map((calc) => [
      calc.id.toString(),
      formatDate(calc.date),
      calc.result.platform,
      calc.result.postType,
      calc.parameters.creatorSize,
      calc.parameters.contentTopic,
      `$${calc.result.totalEMV.toFixed(2)}`,
    ]);

    // Convert to CSV
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // Create a download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `EMV_Calculation_History_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewDetails = (calculation: EMVCalculation) => {
    setSelectedCalculation(calculation);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-primary-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Calculator</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-primary-900">EMV Calculation History</h1>
          <div>
            <Button
              onClick={handleExport}
              disabled={calculations.length === 0}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <FileDown className="h-4 w-4" />
              <span>Export All</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-500">Loading calculations...</p>
                  </div>
                </div>
              ) : calculations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No calculations found</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't performed any EMV calculations yet.
                  </p>
                  <Link href="/">
                    <Button>Create Your First Calculation</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">
                    Your EMV Calculations
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>Post Type</TableHead>
                          <TableHead>Creator Size</TableHead>
                          <TableHead>Topic</TableHead>
                          <TableHead>Total EMV</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calculations.map((calculation) => (
                          <TableRow key={calculation.id}>
                            <TableCell className="font-medium">
                              {formatDate(calculation.date)}
                            </TableCell>
                            <TableCell>
                              {calculation.result.platform.charAt(0).toUpperCase() +
                                calculation.result.platform.slice(1)}
                            </TableCell>
                            <TableCell>
                              {calculation.result.postType.charAt(0).toUpperCase() +
                                calculation.result.postType.slice(1)}
                            </TableCell>
                            <TableCell>
                              {calculation.parameters.creatorSize
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </TableCell>
                            <TableCell>
                              {calculation.parameters.contentTopic
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ${calculation.result.totalEMV.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => viewDetails(calculation)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">View details</span>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>EMV Calculation Details</DialogTitle>
                                  </DialogHeader>
                                  {selectedCalculation && (
                                    <div className="pt-4">
                                      <p className="text-sm text-gray-500 mb-4">
                                        Calculation from {formatDate(selectedCalculation.date)}
                                      </p>
                                      <EMVResults results={selectedCalculation.result} />
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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