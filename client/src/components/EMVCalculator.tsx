import { useState } from "react";
import { EMVForm } from "./EMVForm";
import { EMVResults } from "./EMVResults";
import { EMVReference } from "./EMVReference";
import { calculateEMV } from "@/lib/emv-calculator";
import { FormValues, EMVResult, EMVBreakdownItem } from "@/lib/emv-data";

export function EMVCalculator() {
  const [results, setResults] = useState<EMVResult | null>(null);

  const onCalculate = (values: FormValues) => {
    const result = calculateEMV(values);
    setResults(result);
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <EMVForm onSubmit={onCalculate} />
        </div>

        {/* Results Section */}
        <div className="lg:col-span-1">
          <EMVResults results={results} />
        </div>
      </div>

      {/* Reference Card */}
      <EMVReference />
    </div>
  );
}
