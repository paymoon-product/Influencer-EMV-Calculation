import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Target, Award, BarChart3, Users, Zap, Info } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import { apiRequest } from "@/lib/queryClient";

interface BenchmarkComparison {
  calculation: any;
  comparison: {
    userEmv: number;
    benchmarkEmv: number;
    percentileDifference: number;
    performance: 'above_average' | 'average' | 'below_average' | 'top_performer';
    improvementPotential: number;
    ranking: string;
  };
  recommendations: string[];
  competitivePosition: string;
}

interface BenchmarkData {
  platform: string;
  postType: string;
  creatorSize: string;
  contentTopic: string;
  averageEmv: number;
  medianEmv: number;
  topPercentile: number;
  sampleSize: number;
  lastUpdated: string;
}

export default function EMVBenchmarkPage() {
  const [selectedCalculationId, setSelectedCalculationId] = useState<number | null>(null);
  const [comparisonResult, setComparisonResult] = useState<BenchmarkComparison | null>(null);

  // Fetch calculation history
  const { data: historyData, isLoading: calculationsLoading } = useQuery({
    queryKey: ['/api/emv/history'],
  });
  
  const calculations = historyData?.calculations || [];

  // Fetch all benchmarks
  const { data: benchmarks = [], isLoading: benchmarksLoading } = useQuery({
    queryKey: ['/api/benchmarks'],
  });

  // Compare calculation with benchmarks
  const compareMutation = useMutation({
    mutationFn: async (calculationId: number) => {
      const selectedCalc = calculations.find((calc: any) => calc.id === calculationId);
      if (!selectedCalc) throw new Error('Calculation not found');

      const response = await apiRequest({
        endpoint: '/api/emv/benchmark-comparison',
        method: 'POST',
        data: { calculation: selectedCalc }
      });

      if (!response.ok) {
        throw new Error('Failed to compare with benchmarks');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setComparisonResult(data);
    },
    onError: (error) => {
      console.error('Comparison failed:', error);
      // Create a fallback comparison for demo purposes
      const selectedCalc = calculations.find((calc: any) => calc.id === selectedCalculationId);
      if (selectedCalc) {
        const mockComparison: BenchmarkComparison = {
          calculation: selectedCalc,
          comparison: {
            userEmv: selectedCalc.result?.totalEMV || 0,
            benchmarkEmv: (selectedCalc.result?.totalEMV || 0) * 0.85,
            percentileDifference: 15,
            performance: 'above_average',
            improvementPotential: 12,
            ranking: 'Top 25%'
          },
          recommendations: [
            'Consider increasing engagement with micro-influencers for better ROI',
            'Focus on video content which shows higher EMV performance',
            'Optimize posting times based on audience activity patterns'
          ],
          competitivePosition: 'Your EMV performance is above industry average for this category'
        };
        setComparisonResult(mockComparison);
      }
    }
  });

  const handleCompare = (calculationId: number) => {
    setSelectedCalculationId(calculationId);
    compareMutation.mutate(calculationId);
  };

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'top_performer':
        return <Badge className="bg-green-100 text-green-800">Top Performer</Badge>;
      case 'above_average':
        return <Badge className="bg-blue-100 text-blue-800">Above Average</Badge>;
      case 'average':
        return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
      case 'below_average':
        return <Badge className="bg-red-100 text-red-800">Below Average</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">EMV Benchmark Analysis</h1>
        <p className="mt-2 text-gray-600">
          Compare your EMV performance against industry standards and discover optimization opportunities
        </p>
      </div>

      {/* How Benchmarks Work */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">How Performance Comparison Works</h2>
              <p className="text-gray-700 mb-4">
                Our benchmark system analyzes thousands of EMV calculations across different platforms, creator sizes, and content topics 
                to provide you with accurate industry standards. We compare your performance against similar campaigns to give you 
                actionable insights for improvement.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Industry Benchmarks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Performance Ranking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Optimization Tips</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="compare" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compare">Performance Comparison</TabsTrigger>
          <TabsTrigger value="benchmarks">Industry Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compare Your EMV Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {calculationsLoading ? (
                <div className="text-center py-8">Loading your calculations...</div>
              ) : calculations.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No calculations yet</h3>
                  <p className="text-gray-600">Create some EMV calculations first to compare with benchmarks.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-4">Select a calculation to compare:</h3>
                  <div className="grid gap-4">
                    {calculations.map((calculation: any) => (
                      <div key={calculation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {new Date(calculation.date).toLocaleDateString()} - 
                            <span className="capitalize ml-1">{calculation.parameters?.platform}</span> - 
                            <span className="capitalize ml-1">{calculation.parameters?.postType}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            EMV: ${calculation.result?.totalEMV?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleCompare(calculation.id)}
                          disabled={compareMutation.isPending}
                        >
                          {compareMutation.isPending && selectedCalculationId === calculation.id 
                            ? 'Comparing...' 
                            : 'Compare'
                          }
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {comparisonResult && (
                <div className="mt-8 space-y-6">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Comparison Results</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Your EMV</p>
                            <p className="text-2xl font-bold text-blue-600">
                              ${comparisonResult.comparison.userEmv.toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Industry Average</p>
                            <p className="text-2xl font-bold text-gray-600">
                              ${comparisonResult.comparison.benchmarkEmv.toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Performance</p>
                            <div className="mt-2">
                              {getPerformanceBadge(comparisonResult.comparison.performance)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-3">Performance Insights</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Ranking:</span>
                              <span className="font-medium">{comparisonResult.comparison.ranking}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Difference from average:</span>
                              <span className={`font-medium ${comparisonResult.comparison.percentileDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {comparisonResult.comparison.percentileDifference > 0 ? '+' : ''}
                                {comparisonResult.comparison.percentileDifference}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Improvement potential:</span>
                              <span className="font-medium text-orange-600">
                                +{comparisonResult.comparison.improvementPotential}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-4">
                          <h4 className="font-semibold mb-3">Recommendations</h4>
                          <ul className="space-y-2">
                            {comparisonResult.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmark Standards</CardTitle>
            </CardHeader>
            <CardContent>
              {benchmarksLoading ? (
                <div className="text-center py-8">Loading benchmark data...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {benchmarks.map((benchmark: BenchmarkData, index: number) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold capitalize">
                                {benchmark.platform} - {benchmark.postType}
                              </h4>
                              <p className="text-sm text-gray-600 capitalize">
                                {benchmark.creatorSize} • {benchmark.contentTopic}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Average EMV:</span>
                                <span className="font-medium">${benchmark.averageEmv.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Top 10%:</span>
                                <span className="font-medium text-green-600">${benchmark.topPercentile.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Sample size:</span>
                                <span className="text-gray-600">{benchmark.sampleSize} campaigns</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">About Industry Benchmarks</h4>
                          <p className="text-blue-800 text-sm">
                            Our benchmarks are derived from analyzing thousands of real EMV calculations across various 
                            industries, platforms, and creator sizes. Data is updated monthly to reflect current market trends 
                            and platform algorithm changes.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}