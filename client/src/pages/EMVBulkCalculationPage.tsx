import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UploadCloud, FileDown, FileX, AlertCircle, Check, FilePlus2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { calculateEMV } from "@/lib/emv-calculator";
import { FormValues, EMVResult } from "@/lib/emv-data";
import { apiRequest } from "@/lib/queryClient";

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
  // Required fields with validation rules
  const requiredFields = {
    "Platform": ["instagram", "tiktok", "youtube", "pinterest"],
    "Post Type": null, // Will be validated against platform
    "Creator Size": ["nano", "micro", "mid_tier", "macro", "mega"],
    "Content Topic": ["beauty", "fashion", "fitness", "finance", "food", "game", "music", "travel", "technology", "other"]
  };

  const validPostTypes = {
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

  // Validate required fields
  for (const [field, validValues] of Object.entries(requiredFields)) {
    if (!rowData[field] || rowData[field].trim() === "") {
      return [false, `${field} is required`];
    }

    if (validValues && !validValues.includes(rowData[field].toLowerCase())) {
      return [false, `${field} must be one of: ${validValues.join(', ')}`];
    }
  }

  // Special validation for post type based on platform
  const platform = rowData["Platform"].toLowerCase();
  const postType = rowData["Post Type"].toLowerCase();
  
  if (!validPostTypes[platform]?.includes(postType)) {
    return [false, `Invalid Post Type for ${platform}. Must be one of: ${validPostTypes[platform]?.join(', ')}`];
  }

  // Check if at least one engagement metric has a value
  const metricFields = ["Impressions", "Views", "Likes", "Comments", "Shares", "Saves", "Clicks", "Closeups"];
  const hasMetrics = metricFields.some(field => {
    const value = rowData[field];
    return value && value.trim() !== "" && !isNaN(Number(value));
  });

  if (!hasMetrics) {
    return [false, "At least one engagement metric is required"];
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
          });
          
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
          <h1 className="text-xl font-semibold text-primary-900">Bulk EMV Calculator</h1>
          <div></div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-primary-900 mb-2">Bulk EMV Calculation</h2>
                  <p className="text-gray-600 mb-4 md:mb-0">
                    Upload a CSV file with multiple creators to calculate EMV in bulk.
                  </p>
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
              <div className="border border-dashed border-gray-300 rounded-lg p-6 mb-6">
                <div className="flex flex-col items-center text-center">
                  <UploadCloud className="h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Upload CSV File</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload a CSV file with creator data for bulk EMV calculation
                  </p>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".csv" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mb-2"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4 mr-1" />
                        Select CSV File
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-400">
                    Supported format: CSV with headers
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {calculationRows.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button 
                    onClick={calculateAllEMV} 
                    disabled={isLoading || calculationRows.length === 0 || hasErrors}
                    className="flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Calculate EMV Values
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={saveAllCalculations} 
                    disabled={isSaving || calculationRows.filter(r => r.result && !r.error).length === 0}
                    className="flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
                          <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                        </svg>
                        Save All Calculations
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={exportResults} 
                    disabled={calculationRows.length === 0}
                    className="flex items-center"
                  >
                    <FileDown className="h-4 w-4 mr-1" />
                    Export Results
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={clearCalculations} 
                    disabled={calculationRows.length === 0}
                    className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FileX className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              )}

              {/* Validation Errors Alert */}
              {hasErrors && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    Some rows contain validation errors. Please fix the errors before calculating EMV.
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      <li>Platform must be one of: instagram, tiktok, youtube, pinterest</li>
                      <li>Post Type must match the selected platform (e.g., post, reel, story for Instagram)</li>
                      <li>Creator Size must be one of: nano, micro, mid_tier, macro, mega</li>
                      <li>Content Topic must be one of: beauty, fashion, fitness, finance, food, game, music, travel, technology, other</li>
                      <li>At least one engagement metric (likes, views, etc.) must have a value</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Results Table */}
              {calculationRows.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">ID</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Post Type</TableHead>
                        <TableHead>Creator Size</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead className="text-right">Total EMV</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculationRows.map((row) => (
                        <TableRow key={row.id} className={row.error ? "bg-red-50" : row.result ? "" : "bg-gray-50"}>
                          <TableCell className="font-medium">{row.id}</TableCell>
                          <TableCell>{row.creatorName}</TableCell>
                          <TableCell className="capitalize">{row.platform}</TableCell>
                          <TableCell className="capitalize">{row.postType}</TableCell>
                          <TableCell className="capitalize">{row.creatorSize.replace('_', ' ')}</TableCell>
                          <TableCell className="capitalize">{row.contentTopic.replace('_', ' ')}</TableCell>
                          <TableCell className="text-right font-medium">
                            {row.result ? (
                              <span className="text-green-600">${row.result.totalEMV.toFixed(2)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.error ? (
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-xs text-red-500" title={row.error}>Error</span>
                              </div>
                            ) : row.result ? (
                              <div className="flex items-center">
                                <Check className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-xs text-green-500">Success</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Not Calculated</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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