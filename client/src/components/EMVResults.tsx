import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { EMVResult } from "@/lib/emv-data";
import { Badge } from "@/components/ui/badge";

type EMVResultsProps = {
  results: EMVResult | null;
};

export function EMVResults({ results }: EMVResultsProps) {
  const handleExport = () => {
    if (!results) return;

    // Create CSV content
    const headers = ["Parameter", "Value"];
    const rows = [
      ["Platform", results.platform],
      ["Post Type", results.postType],
      ["Creator Factor", results.creatorFactor.toString()],
      ["Post Type Factor", results.postTypeFactor.toString()],
      ["Topic Factor", results.topicFactor.toString()],
    ];

    // Add breakdown rows
    results.breakdown.forEach((item) => {
      rows.push([`${item.type} Count`, item.count.toString()]);
      rows.push([`${item.type} Base Value`, `$${item.baseValue.toFixed(2)}`]);
      rows.push([`${item.type} EMV`, `$${item.emv.toFixed(2)}`]);
    });

    rows.push(["Total EMV", `$${results.totalEMV.toFixed(2)}`]);

    // Convert to CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create a download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EMV_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-primary-900">EMV Results</h3>
          {results && (
            <div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          )}
        </div>

        {!results ? (
          <div className="flex flex-col items-center justify-center py-12 text-center flex-grow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-600 mb-2">No calculations yet</p>
            <p className="text-gray-400 text-sm">Fill in the form to calculate EMV</p>
          </div>
        ) : (
          <div className="flex flex-col flex-grow">
            {/* Total EMV */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total EMV</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  Updated 2025 Model
                </Badge>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${results.totalEMV.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="flex-grow">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Calculation Breakdown
              </h4>
              <div className="space-y-4">
                <div className="bg-white rounded border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-2 text-xs border-b border-gray-100">
                    <div className="p-2 font-medium bg-gray-50 text-gray-600">
                      Parameter
                    </div>
                    <div className="p-2 font-medium bg-gray-50 text-gray-600">
                      Value
                    </div>
                  </div>
                  <div className="max-h-64 overflow-auto">
                    {/* Platform and Post Type */}
                    <div className="grid grid-cols-2 text-xs border-b border-gray-50">
                      <div className="p-2 text-gray-700">Platform</div>
                      <div className="p-2 text-gray-900">
                        {results.platform.charAt(0).toUpperCase() + results.platform.slice(1)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 text-xs border-b border-gray-50">
                      <div className="p-2 text-gray-700">Post Type</div>
                      <div className="p-2 text-gray-900">
                        {results.postType.charAt(0).toUpperCase() + results.postType.slice(1)}
                      </div>
                    </div>

                    {/* Factors */}
                    <div className="grid grid-cols-2 text-xs border-b border-gray-50">
                      <div className="p-2 text-gray-700">Creator Factor</div>
                      <div className="p-2 text-gray-900">{results.creatorFactor.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 text-xs border-b border-gray-50">
                      <div className="p-2 text-gray-700">Post Type Factor</div>
                      <div className="p-2 text-gray-900">{results.postTypeFactor.toFixed(2)}</div>
                    </div>
                    <div className="grid grid-cols-2 text-xs border-b border-gray-50">
                      <div className="p-2 text-gray-700">Topic Factor</div>
                      <div className="p-2 text-gray-900">{results.topicFactor.toFixed(2)}</div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100"></div>

                    {/* Engagement breakdown */}
                    {results.breakdown.map((item, idx) => (
                      <div key={idx}>
                        <div className="grid grid-cols-2 text-xs border-b border-gray-50">
                          <div className="p-2 text-gray-700">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Count
                          </div>
                          <div className="p-2 text-gray-900">{item.count.toLocaleString()}</div>
                        </div>

                        <div className="grid grid-cols-2 text-xs border-b border-gray-50">
                          <div className="p-2 text-gray-700">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Base Value
                          </div>
                          <div className="p-2 text-gray-900">${item.baseValue.toFixed(2)}</div>
                        </div>

                        <div className="grid grid-cols-2 text-xs border-b border-gray-50">
                          <div className="p-2 text-gray-700">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} EMV
                          </div>
                          <div className="p-2 font-medium text-blue-700">${item.emv.toFixed(2)}</div>
                        </div>

                        {idx < results.breakdown.length - 1 && (
                          <div className="border-t border-gray-50"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <details className="group">
                <summary className="flex cursor-pointer items-center text-sm font-medium text-gray-600">
                  <svg
                    className="mr-1.5 h-4 w-4 transition-transform group-open:rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  View Formula Details
                </summary>
                <div className="mt-3 text-xs text-gray-600 leading-relaxed">
                  <p className="mb-2">
                    EMV = Σ(Engagement_Type × Base_Value × Creator_Factor × Post_Type_Factor ×
                    Topic_Factor)
                  </p>
                  <p>
                    Each engagement type (likes, comments, etc.) is multiplied by its base value and
                    all relevant factors to determine its contribution to the total EMV.
                  </p>
                </div>
              </details>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
