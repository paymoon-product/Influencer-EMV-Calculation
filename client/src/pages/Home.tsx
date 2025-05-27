import { EMVCalculator } from "@/components/EMVCalculator";
import { User, Users, Upload, Download, FileSpreadsheet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { calculateEMV } from "@/lib/emv-calculator";
import { FormValues, EMVResult } from "@/lib/emv-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BulkCalculationRow = {
  id: number;
  creatorName: string;
  platform: string;
  postType: string;
  creatorSize: string;
  contentTopic: string;
  metrics: {[key: string]: number};
  result: EMVResult | null;
  error: string | null;
};

export default function Home() {
  const [bulkData, setBulkData] = useState<BulkCalculationRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const downloadCSVTemplate = () => {
    const headers = [
      "Creator Name",
      "Platform", 
      "Post Type",
      "Creator Size",
      "Content Topic",
      "Impressions",
      "Views",
      "Likes", 
      "Comments",
      "Shares",
      "Saves",
      "Clicks",
      "Closeups"
    ];

    const rows = [
      [
        "Example Creator 1",
        "instagram",
        "post", 
        "micro",
        "beauty",
        "50000",
        "",
        "5000",
        "300",
        "100", 
        "200",
        "",
        ""
      ]
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "emv_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    const rows: BulkCalculationRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 5) {
        const rowData: BulkCalculationRow = {
          id: i,
          creatorName: values[0] || `Creator ${i}`,
          platform: values[1]?.toLowerCase() || '',
          postType: values[2]?.toLowerCase() || '',
          creatorSize: values[3]?.toLowerCase() || '',
          contentTopic: values[4]?.toLowerCase() || '',
          metrics: {},
          result: null,
          error: null
        };

        // Parse engagement metrics
        const metricFields = ["impressions", "views", "likes", "comments", "shares", "saves", "clicks", "closeups"];
        metricFields.forEach((field, index) => {
          const value = values[5 + index];
          if (value && !isNaN(Number(value))) {
            rowData.metrics[field] = Number(value);
          }
        });

        rows.push(rowData);
      }
    }

    setBulkData(rows);
    setIsProcessing(true);

    // Process calculations
    const updatedRows = rows.map(row => {
      try {
        const formValues: FormValues = {
          platform: row.platform,
          postType: row.postType,
          creatorSize: row.creatorSize,
          contentTopic: row.contentTopic,
          ...row.metrics
        };

        const result = calculateEMV(formValues);
        return { ...row, result, error: null };
      } catch (error) {
        return { ...row, result: null, error: error instanceof Error ? error.message : 'Calculation failed' };
      }
    });

    setBulkData(updatedRows);
    setIsProcessing(false);

    toast({
      title: "Bulk calculation complete",
      description: `Processed ${updatedRows.length} rows`,
    });
  };

  const clearData = () => {
    setBulkData([]);
  };

  const exportResults = () => {
    if (bulkData.length === 0) return;

    const headers = ["Creator Name", "Platform", "Post Type", "Creator Size", "Content Topic", "Total EMV", "Status"];
    const rows = bulkData.map(row => [
      row.creatorName,
      row.platform,
      row.postType,
      row.creatorSize,
      row.contentTopic,
      row.result ? `$${row.result.totalEMV.toLocaleString()}` : 'Error',
      row.error || 'Success'
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `emv_bulk_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">EMV Calculator</h1>
        <p className="mt-2 text-gray-600">
          Calculate the monetary impact of organic social media engagement
        </p>
      </div>
          
      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Individual Input
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Bulk Calculation
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual" className="space-y-6">
          <EMVCalculator />
        </TabsContent>
        
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bulk EMV Calculation</h3>
                  <p className="text-gray-600 mb-4">Upload a CSV file with multiple creators to calculate EMV in bulk.</p>
                  
                  <div className="flex space-x-4 mb-6">
                    <Button onClick={downloadCSVTemplate} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    
                    <div>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="csv-upload"
                      />
                      <Button asChild>
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload CSV
                        </label>
                      </Button>
                    </div>

                    {bulkData.length > 0 && (
                      <>
                        <Button onClick={exportResults} variant="outline">
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Export Results
                        </Button>
                        <Button onClick={clearData} variant="outline">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Data
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {isProcessing && (
                  <div className="text-center py-8">
                    <div className="text-gray-600">Processing calculations...</div>
                  </div>
                )}

                {bulkData.length > 0 && !isProcessing && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Results ({bulkData.length} rows)</h4>
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Creator</TableHead>
                              <TableHead>Platform</TableHead>
                              <TableHead>Post Type</TableHead>
                              <TableHead>Creator Size</TableHead>
                              <TableHead>Total EMV</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bulkData.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell className="font-medium">{row.creatorName}</TableCell>
                                <TableCell className="capitalize">{row.platform}</TableCell>
                                <TableCell className="capitalize">{row.postType}</TableCell>
                                <TableCell>{row.creatorSize}</TableCell>
                                <TableCell className="font-semibold">
                                  {row.result ? `$${row.result.totalEMV.toLocaleString()}` : '-'}
                                </TableCell>
                                <TableCell>
                                  {row.error ? (
                                    <span className="text-red-600 text-sm">{row.error}</span>
                                  ) : (
                                    <span className="text-green-600 text-sm">Success</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
