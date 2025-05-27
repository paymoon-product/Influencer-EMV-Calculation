import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileDown, Eye, Calendar, Download, FileSpreadsheet, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { EMVCalculation } from "@/lib/emv-data";
import { exportCalculationsToCSV, exportCalculationsToPDF } from "@/lib/export-utils";
import { MainLayout } from "@/components/MainLayout";
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
} from "@/components/ui/dialog";

export default function EMVHistoryPage() {
  const [calculations, setCalculations] = useState<EMVCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalculation, setSelectedCalculation] = useState<EMVCalculation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const response = await apiRequest({
          endpoint: '/api/emv/history',
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch calculation history');
        }

        const data = await response.json();
        setCalculations(data.calculations || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load calculation history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCalculations();
  }, [toast]);

  const handleExportCSV = () => {
    if (calculations.length === 0) {
      toast({
        title: "No data to export",
        description: "Please create some EMV calculations first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      exportCalculationsToCSV(calculations as any);
      toast({
        title: "Export successful",
        description: "CSV file has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    if (calculations.length === 0) {
      toast({
        title: "No data to export",
        description: "Please create some EMV calculations first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      exportCalculationsToPDF(calculations as any);
      toast({
        title: "Export initiated",
        description: "PDF report is being generated.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF.",
        variant: "destructive",
      });
    }
  };

  const viewDetails = (calculation: EMVCalculation) => {
    setSelectedCalculation(calculation);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">EMV Calculation History</h1>
          <p className="mt-2 text-gray-600">
            View and manage your previous EMV calculations
          </p>
        </div>
        <div className="flex justify-center py-12">
          <div className="text-gray-600">Loading your calculation history...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">EMV Calculation History</h1>
        <p className="mt-2 text-gray-600">
          View and manage your previous EMV calculations
        </p>
      </div>

      {calculations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No calculations yet</h3>
              <p className="text-gray-600">Start by creating your first EMV calculation.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {calculations.length} calculation{calculations.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Post Type</TableHead>
                    <TableHead>Creator Size</TableHead>
                    <TableHead>Total EMV</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.map((calculation) => (
                    <TableRow key={calculation.id}>
                      <TableCell>
                        {new Date(calculation.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        {calculation.parameters.platform}
                      </TableCell>
                      <TableCell className="capitalize">
                        {calculation.parameters.postType}
                      </TableCell>
                      <TableCell>{calculation.parameters.creatorSize}</TableCell>
                      <TableCell className="font-semibold">
                        ${calculation.result.totalEMV.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => viewDetails(calculation)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedCalculation && (
        <Dialog open={!!selectedCalculation} onOpenChange={() => setSelectedCalculation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>EMV Calculation Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Platform</label>
                  <div className="text-lg capitalize">{selectedCalculation.parameters.platform}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Post Type</label>
                  <div className="text-lg capitalize">{selectedCalculation.parameters.postType}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Creator Size</label>
                  <div className="text-lg">{selectedCalculation.parameters.creatorSize}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Content Topic</label>
                  <div className="text-lg capitalize">{selectedCalculation.parameters.contentTopic}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-3">EMV Breakdown</h4>
                <div className="space-y-2">
                  {selectedCalculation.result.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <span className="capitalize">{item.type}</span>
                      <div className="text-right">
                        <div className="font-semibold">${item.emv.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{item.count} × ${item.baseValue}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                  <span className="text-lg font-bold">Total EMV</span>
                  <span className="text-xl font-bold text-primary-600">
                    ${selectedCalculation.result.totalEMV.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}