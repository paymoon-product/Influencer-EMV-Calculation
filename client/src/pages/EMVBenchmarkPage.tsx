import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Target, Award, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";


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

  // Fetch calculation history
  const { data: calculations = [], isLoading: calculationsLoading } = useQuery({
    queryKey: ['/api/emv/history'],
  });

  // Fetch all benchmarks
  const { data: benchmarks = [], isLoading: benchmarksLoading } = useQuery({
    queryKey: ['/api/benchmarks'],
  });

  // Benchmark comparison mutation
  const benchmarkMutation = useMutation({
    mutationFn: async (calculationId: number) => {
      const response = await fetch('/api/emv/benchmark-comparison', {
        method: 'POST',
        body: JSON.stringify({ calculationId }),
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emv/benchmark-comparison'] });
    },
  });

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'top_performer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'above_average':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'average':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'below_average':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'top_performer':
        return <Award className="h-4 w-4" />;
      case 'above_average':
        return <TrendingUp className="h-4 w-4" />;
      case 'average':
        return <Target className="h-4 w-4" />;
      case 'below_average':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <MainLayout>
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Calculator
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Benchmarks</h1>
              <p className="text-gray-600">Compare your EMV performance against industry standards</p>
            </div>
          </div>

          <Tabs defaultValue="comparison" className="space-y-6">
            <TabsList>
              <TabsTrigger value="comparison">Performance Comparison</TabsTrigger>
              <TabsTrigger value="benchmarks">Industry Benchmarks</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-6">
              {/* Calculation Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Select Calculation to Compare</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {calculationsLoading ? (
                    <div className="text-center py-4">Loading calculations...</div>
                  ) : (calculations as any[]).length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No calculations found. Create an EMV calculation first to see benchmark comparisons.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {(calculations as any[]).slice(0, 10).map((calc: any) => (
                        <div
                          key={calc.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedCalculationId === calc.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedCalculationId(calc.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {calc.parameters.platform} • {calc.parameters.postType} • {calc.parameters.creatorSize}
                              </p>
                              <p className="text-sm text-gray-500">
                                {calc.parameters.contentTopic} • {new Date(calc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(calc.result.totalEMV)}</p>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  benchmarkMutation.mutate(calc.id);
                                }}
                                disabled={benchmarkMutation.isPending}
                              >
                                {benchmarkMutation.isPending ? 'Comparing...' : 'Compare'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comparison Results */}
              {benchmarkMutation.data && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Performance Comparison</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Your EMV</span>
                            <span className="text-lg font-bold text-blue-600">
                              {formatCurrency(benchmarkMutation.data.comparison.userEmv)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Industry Average</span>
                            <span className="text-lg font-semibold text-gray-600">
                              {formatCurrency(benchmarkMutation.data.comparison.benchmarkEmv)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Difference</span>
                            <span className={`text-lg font-bold ${
                              benchmarkMutation.data.comparison.percentileDifference >= 0 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {formatPercentage(benchmarkMutation.data.comparison.percentileDifference)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Badge 
                            className={`${getPerformanceColor(benchmarkMutation.data.comparison.performance)} flex items-center space-x-2 w-fit`}
                          >
                            {getPerformanceIcon(benchmarkMutation.data.comparison.performance)}
                            <span>{benchmarkMutation.data.comparison.ranking}</span>
                          </Badge>
                          {benchmarkMutation.data.comparison.improvementPotential > 0 && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Improvement Potential</p>
                              <p className="text-lg font-semibold text-orange-600">
                                {formatCurrency(benchmarkMutation.data.comparison.improvementPotential)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Competitive Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {benchmarkMutation.data.competitivePosition}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {(benchmarkMutation.data as any).recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="benchmarks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Benchmark Data</CardTitle>
                  <p className="text-sm text-gray-600">
                    Current industry performance standards across platforms and content types
                  </p>
                </CardHeader>
                <CardContent>
                  {benchmarksLoading ? (
                    <div className="text-center py-8">Loading benchmark data...</div>
                  ) : (
                    <div className="space-y-6">
                      {['instagram', 'tiktok', 'youtube', 'pinterest'].map(platform => {
                        const platformBenchmarks = (benchmarks as any[]).filter((b: any) => b.platform === platform);
                        if (platformBenchmarks.length === 0) return null;

                        return (
                          <div key={platform} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-4 capitalize">{platform}</h3>
                            <div className="grid gap-4">
                              {platformBenchmarks.map((benchmark: any, index: number) => (
                                <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded">
                                  <div>
                                    <p className="text-xs text-gray-500">Post Type</p>
                                    <p className="font-medium capitalize">{benchmark.postType}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Creator Size</p>
                                    <p className="font-medium capitalize">{benchmark.creatorSize}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Topic</p>
                                    <p className="font-medium capitalize">{benchmark.contentTopic}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Avg EMV</p>
                                    <p className="font-medium">{formatCurrency(benchmark.averageEmv)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </MainLayout>
  );
}