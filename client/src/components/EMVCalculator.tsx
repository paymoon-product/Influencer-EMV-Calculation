import { useState } from "react";
import { EMVForm } from "./EMVForm";
import { EMVResults } from "./EMVResults";
import { EMVReference } from "./EMVReference";
import { calculateEMV } from "@/lib/emv-calculator";
import { FormValues, EMVResult } from "@/lib/emv-data";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function EMVCalculator() {
  const { toast } = useToast();
  const [results, setResults] = useState<EMVResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCalculate = async (values: FormValues) => {
    // Calculate EMV locally
    const result = calculateEMV(values);
    setResults(result);
    
    // Save calculation to database
    try {
      setIsSaving(true);
      const response = await apiRequest(
        "POST",
        "/api/emv/calculate",
        {
          ...values,
          result
        }
      );
      
      if (response.ok) {
        toast({
          title: "Calculation Saved",
          description: "Your EMV calculation has been saved to the database."
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save calculation to the database.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the calculation.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <EMVForm onSubmit={onCalculate} />
          
          {/* View History Link */}
          <div className="mt-4 flex justify-end">
            <Link href="/history" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Calculation History
            </Link>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-1">
          <EMVResults results={results} isSaving={isSaving} />
        </div>
      </div>
    </div>
  );
}
