import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UploadCloud, FileDown, FileX, AlertCircle, Check, FilePlus2, CloudLightning, Settings, BookOpen, Clock } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { calculateEMV } from "@/lib/emv-calculator";
import { FormValues, EMVResult } from "@/lib/emv-data";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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

function downloadCSVTemplate() {
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
    ],
    [
      "Example Creator 2",
      "tiktok",
      "video",
      "nano",
      "fashion",
      "",
      "100000",
      "15000",
      "800",
      "500",
      "300",
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
  link.setAttribute("download", "emv_bulk_calculation_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function validateRow(row: string[], headers: string[]): [boolean, any] {
  // Only Platform, Post Type, and Views/Impressions are required
  const validPlatforms = ["instagram", "tiktok", "youtube", "pinterest"];
  const validCreatorSizes = ["brand_fan", "nano", "micro", "mid_tier", "macro", "celebrity"];
  const validContentTopics = ["beauty", "fashion", "fitness", "finance", "food", "game", "music", "travel", "technology", "other"];

  const validPostTypes: { [key: string]: string[] } = {
    "instagram": ["post", "reel", "story"],
    "tiktok": ["video"],
    "youtube": ["video", "shorts"],
    "pinterest": ["pin"]
  };

  if (row.length !== headers.length) {
    return [false, "Row has incorrect number of columns"];
  }

  const rowData: {[key: string]: string} = {};
  headers.forEach((header, index) => {
    rowData[header] = row[index];
  });

  // Validate required fields: Platform and Post Type only
  if (!rowData["Platform"] || rowData["Platform"].trim() === "") {
    return [false, "Platform is required"];
  }

  if (!validPlatforms.includes(rowData["Platform"].toLowerCase())) {
    return [false, `Platform must be one of: ${validPlatforms.join(', ')}`];
  }

  if (!rowData["Post Type"] || rowData["Post Type"].trim() === "") {
    return [false, "Post Type is required"];
  }

  // Validate Creator Size if provided (optional but must be valid)
  if (rowData["Creator Size"] && rowData["Creator Size"].trim() !== "") {
    if (!validCreatorSizes.includes(rowData["Creator Size"].toLowerCase())) {
      return [false, `Creator Size "${rowData["Creator Size"]}" is invalid. Valid sizes: ${validCreatorSizes.join(', ')}`];
    }
  }

  // Validate Content Topic if provided (optional but must be valid)
  if (rowData["Content Topic"] && rowData["Content Topic"].trim() !== "") {
    if (!validContentTopics.includes(rowData["Content Topic"].toLowerCase())) {
      return [false, `Content Topic "${rowData["Content Topic"]}" is invalid. Valid topics: ${validContentTopics.join(', ')}`];
    }
  }

  // Special validation for post type based on platform
  const platform = rowData["Platform"].toLowerCase();
  const postType = rowData["Post Type"].toLowerCase();
  
  if (!validPostTypes[platform] || !validPostTypes[platform].includes(postType)) {
    return [false, `Invalid Post Type for ${platform}. Must be one of: ${validPostTypes[platform]?.join(', ') || 'none'}`];
  }

  // Require at least Views or Impressions
  const hasViews = rowData["Views"] && rowData["Views"].trim() !== "" && !isNaN(parseFloat(rowData["Views"]));
  const hasImpressions = rowData["Impressions"] && rowData["Impressions"].trim() !== "" && !isNaN(parseFloat(rowData["Impressions"]));

  if (!hasViews && !hasImpressions) {
    return [false, "Either Views or Impressions must be provided"];
  }

  return [true, null];
}

export default function EMVBulkCalculationPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [calculationRows, setCalculationRows] = useState<BulkCalculationRow[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    setHasErrors(false);
    
    const file = event.target.files?.[0];
    if (!file) {
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').map(line => 
          line.split(',').map(cell => cell.trim())
        );
        
        if (lines.length < 2) {
          toast({
            title: "Invalid CSV Format",
            description: "The CSV file must contain a header row and at least one data row",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }

        const headers = lines[0];
        const requiredHeaders = [
          "Creator Name", 
          "Platform", 
          "Post Type", 
          "Creator Size", 
          "Content Topic"
        ];

        // Validate all required headers are present
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          toast({
            title: "Invalid CSV Format",
            description: `Missing required headers: ${missingHeaders.join(", ")}`,
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }

        const dataRows = lines.slice(1).filter(row => row.length > 1); // Skip empty rows
        
        const newCalculationRows: BulkCalculationRow[] = [];
        let validationErrors = false;

        dataRows.forEach((row, index) => {
          const [isValid, error] = validateRow(row, headers);
          
          const rowData: BulkCalculationRow = {
            id: index + 1,
            creatorName: row[headers.indexOf("Creator Name")],
            platform: row[headers.indexOf("Platform")].toLowerCase(),
            postType: row[headers.indexOf("Post Type")].toLowerCase(),
            creatorSize: row[headers.indexOf("Creator Size")].toLowerCase(),
            contentTopic: row[headers.indexOf("Content Topic")].toLowerCase(),
            metrics: {},
            result: null,
            error: isValid ? null : error
          };

          if (!isValid) {
            validationErrors = true;
          }

          // Add all metrics
          const metricFields = ["Impressions", "Views", "Likes", "Comments", "Shares", "Saves", "Clicks", "Closeups"];
          metricFields.forEach(field => {
            const index = headers.indexOf(field);
            if (index !== -1 && row[index] && !isNaN(Number(row[index]))) {
              rowData.metrics[field.toLowerCase()] = Number(row[index]);
            }
          });

          newCalculationRows.push(rowData);
        });

        setCalculationRows(newCalculationRows);
        setHasErrors(validationErrors);
        
        if (validationErrors) {
          toast({
            title: "Validation Errors",
            description: "Some rows contain validation errors. Please fix the errors before calculating EMV.",
            variant: "destructive",
          });
        } else {
          // Auto-calculate EMV values for valid rows
          const calculatedRows = newCalculationRows.map(row => {
            if (row.error) return row;
            
            try {
              // Prepare input for EMV calculation
              const formValues: FormValues = {
                platform: row.platform,
                postType: row.postType,
                creatorSize: row.creatorSize,
                contentTopic: row.contentTopic,
                ...row.metrics
              };
              
              // Calculate EMV
              const result = calculateEMV(formValues);
              
              return {
                ...row,
                result,
                error: null
              };
            } catch (error) {
              return {
                ...row,
                result: null,
                error: "Calculation error. Check input values."
              };
            }
          }));
          
          setCalculationRows(calculatedRows);
          
          toast({
            title: "Calculations Complete",
            description: `Successfully processed ${calculatedRows.filter(row => row.result).length} of ${calculatedRows.length} rows.`,
          });
        }
      } catch (error) {
        toast({
          title: "Error Processing CSV",
          description: "The file could not be processed. Please check the format.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Error Reading File",
        description: "An error occurred while reading the file.",
        variant: "destructive",
      });
      setIsUploading(false);
    };
    
    reader.readAsText(file);
  };

  const calculateAllEMV = () => {
    if (hasErrors) {
      toast({
        title: "Cannot Calculate",
        description: "Please fix all validation errors before calculating.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const updatedRows = calculationRows.map(row => {
      if (row.error) return row;
      
      try {
        // Prepare input for EMV calculation
        const formValues: FormValues = {
          platform: row.platform,
          postType: row.postType,
          creatorSize: row.creatorSize,
          contentTopic: row.contentTopic,
          ...row.metrics
        };
        
        // Calculate EMV
        const result = calculateEMV(formValues);
        
        return {
          ...row,
          result,
          error: null
        };
      } catch (error) {
        return {
          ...row,
          result: null,
          error: "Calculation error. Check input values."
        };
      }
    });
    
    setCalculationRows(updatedRows);
    setIsLoading(false);
    
    toast({
      title: "Calculations Complete",
      description: "All EMV calculations have been processed.",
    });
  };

  const saveAllCalculations = async () => {
    const successfulRows = calculationRows.filter(row => row.result && !row.error);
    
    if (successfulRows.length === 0) {
      toast({
        title: "Nothing to Save",
        description: "There are no successful calculations to save.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      let savedCount = 0;
      
      // Process each calculation sequentially to avoid overwhelming the server
      for (const row of successfulRows) {
        if (!row.result) continue;
        
        const formValues: FormValues = {
          platform: row.platform,
          postType: row.postType,
          creatorSize: row.creatorSize,
          contentTopic: row.contentTopic,
          ...row.metrics
        };
        
        const response = await apiRequest(
          "POST",
          "/api/emv/calculate",
          {
            ...formValues,
            creatorName: row.creatorName,
            result: row.result
          }
        );
        
        if (response.ok) {
          savedCount++;
        }
      }
      
      toast({
        title: "Calculations Saved",
        description: `Successfully saved ${savedCount} of ${successfulRows.length} calculations.`,
      });
    } catch (error) {
      toast({
        title: "Error Saving Calculations",
        description: "An error occurred while saving calculations to the database.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportResults = () => {
    if (calculationRows.length === 0) {
      toast({
        title: "Nothing to Export",
        description: "There are no calculations to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Creator Name",
      "Platform",
      "Post Type",
      "Creator Size",
      "Content Topic",
      "Total EMV",
      "Creator Factor",
      "Post Type Factor",
      "Topic Factor",
      "Status"
    ];

    const rows = calculationRows.map(row => [
      row.creatorName,
      row.platform,
      row.postType,
      row.creatorSize,
      row.contentTopic,
      row.result && typeof row.result.totalEMV !== 'undefined' ? `$${row.result.totalEMV.toFixed(2)}` : "N/A",
      row.result && typeof row.result.creatorFactor !== 'undefined' ? row.result.creatorFactor.toFixed(2) : "N/A",
      row.result && typeof row.result.postTypeFactor !== 'undefined' ? row.result.postTypeFactor.toFixed(2) : "N/A",
      row.result && typeof row.result.topicFactor !== 'undefined' ? row.result.topicFactor.toFixed(2) : "N/A",
      row.error ? "Error" : row.result ? "Success" : "Not Calculated"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EMV_Bulk_Results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearCalculations = () => {
    setCalculationRows([]);
    setHasErrors(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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

      {/* Breadcrumb below header */}
      <div className="bg-gray-50 py-2 px-6 border-b border-gray-200">
        <div className="container mx-auto flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Calculator</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-primary-900 mb-2">Bulk EMV Calculation</h2>
                  <p className="text-gray-600 mb-4 md:mb-0">
                    Upload a CSV file with multiple creators to calculate EMV in bulk. Only Platform, Post Type, and Views/Impressions are required.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-blue-900">Supported Values:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-800">
                      <div>
                        <strong>Creator Sizes:</strong> brand_fan, nano, micro, mid_tier, macro, celebrity
                      </div>
                      <div>
                        <strong>Content Topics:</strong> beauty, fashion, fitness, finance, food, game, music, travel, technology, other
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadCSVTemplate}
                    className="flex items-center"
                  >
                    <FilePlus2 className="h-4 w-4 mr-1" />
                    Download Template
                  </Button>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="border border-dashed border-gray-300 rounded-lg p-6 mb-6 relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv"
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center">
                  <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-2">Drag & drop your CSV file or click to browse</p>
                  <Button 
                    variant="secondary" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mt-2"
                  >
                    {isUploading ? "Uploading..." : "Upload CSV"}
                  </Button>
                </div>
              </div>

              {/* View History Button - Always Visible */}
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/performance-comparison', '_blank')}
                  className="flex items-center"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  View Calculation History
                </Button>
              </div>

              {/* Actions Bar */}
              {calculationRows.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button 
                    onClick={calculateAllEMV} 
                    disabled={isLoading || hasErrors}
                    className="flex items-center"
                  >
                    {isLoading ? "Calculating..." : "Calculate All EMV"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={saveAllCalculations}
                    disabled={isSaving || hasErrors}
                    className="flex items-center"
                  >
                    {isSaving ? "Saving..." : "Save All Calculations"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={exportResults}
                    className="flex items-center"
                  >
                    <FileDown className="h-4 w-4 mr-1" />
                    Export Results
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={clearCalculations}
                    className="flex items-center text-destructive"
                  >
                    <FileX className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              )}

              {/* Show validation errors alert if needed */}
              {hasErrors && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    Some rows contain validation errors. Please review the table below and fix the issues.
                  </AlertDescription>
                </Alert>
              )}

              {/* Table with calculation rows */}
              {calculationRows.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">#</TableHead>
                          <TableHead className="whitespace-nowrap">Creator</TableHead>
                          <TableHead className="whitespace-nowrap">Platform</TableHead>
                          <TableHead className="whitespace-nowrap">Type</TableHead>
                          <TableHead className="whitespace-nowrap">Size</TableHead>
                          <TableHead className="whitespace-nowrap">Topic</TableHead>
                          <TableHead className="whitespace-nowrap">Total EMV</TableHead>
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calculationRows.map((row) => (
                          <TableRow key={row.id} className={row.error ? "bg-red-50" : ""}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.creatorName}</TableCell>
                            <TableCell>{row.platform}</TableCell>
                            <TableCell>{row.postType}</TableCell>
                            <TableCell>{row.creatorSize}</TableCell>
                            <TableCell>{row.contentTopic}</TableCell>
                            <TableCell>
                              {row.result ? `$${row.result.totalEMV.toFixed(2)}` : "-"}
                            </TableCell>
                            <TableCell>
                              {row.error ? (
                                <div className="flex items-center text-destructive text-sm">
                                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                  {row.error}
                                </div>
                              ) : row.result ? (
                                <div className="flex items-center text-green-600 text-sm">
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Success
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm">Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-primary-200 py-4 px-6">
        <div className="container mx-auto text-center text-primary-500 text-sm">
          © {new Date().getFullYear()} Aspire Influencer Marketing Platform | EMV Calculator
        </div>
      </footer>
    </div>
  );
}