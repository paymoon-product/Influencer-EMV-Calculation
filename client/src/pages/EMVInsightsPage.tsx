import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Lightbulb, AlertTriangle, 
  BarChart3, Target, Sparkles, RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, Sliders, Settings, BookOpen, Clock
} from "lucide-react";

interface TrendInsight {
  id: string;
  type: 'trend' | 'recommendation' | 'optimization' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'platform' | 'content' | 'timing' | 'audience' | 'general';
  actionable: boolean;
  confidence: number;
}

interface InsightsReport {
  summary: string;
  insights: TrendInsight[];
  keyMetrics: {
    totalEmv: number;
    averageEmv: number;
    topPerformingPlatform: string;
    topPerformingContent: string;
    growthRate: number;
  };
  recommendations: string[];
}

export default function EMVInsightsPage() {
  const { toast } = useToast();
  const [insights, setInsights] = useState<InsightsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      setRefreshing(true);
      const response = await apiRequest("GET", "/api/emv/insights");
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load AI insights. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to insights service.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />;
      case 'optimization':
        return <Target className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recommendation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'optimization':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-4 right-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-white shadow-lg">
                <Sliders className="h-4 w-4" />
                <span>Options</span>
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

        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center">
                <Sparkles className="h-8 w-8 animate-pulse text-primary mb-4" />
                <p className="text-gray-500">Generating AI-powered insights...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-white shadow-lg">
              <Sliders className="h-4 w-4" />
              <span>Options</span>
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

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-primary-900 mb-2 flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-primary" />
                AI-Powered EMV Insights
              </h2>
              <p className="text-primary-600">
                Personalized insights and recommendations based on your EMV calculation data
              </p>
            </div>
            <div className="flex space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Calculator</span>
                </Button>
              </Link>
              <Button 
                onClick={fetchInsights}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {insights && (
            <div className="space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary-900">
                      ${insights.keyMetrics.totalEmv.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Total EMV</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary-900">
                      ${insights.keyMetrics.averageEmv.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Average EMV</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-lg font-bold text-primary-900 capitalize">
                      {insights.keyMetrics.topPerformingPlatform}
                    </div>
                    <div className="text-sm text-gray-500">Top Platform</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-lg font-bold text-primary-900 capitalize">
                      {insights.keyMetrics.topPerformingContent}
                    </div>
                    <div className="text-sm text-gray-500">Top Content</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary-900 flex items-center">
                      {insights.keyMetrics.growthRate > 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
                      )}
                      {insights.keyMetrics.growthRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Growth Rate</div>
                  </CardContent>
                </Card>
              </div>

              {/* Insights */}
              {insights.insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights.insights.map((insight) => (
                        <div
                          key={insight.id}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getInsightIcon(insight.type)}
                              <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                            </div>
                            <div className="flex space-x-2">
                              <Badge className={getTypeColor(insight.type)}>
                                {insight.type}
                              </Badge>
                              <Badge className={getImpactColor(insight.impact)}>
                                {insight.impact} impact
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{insight.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Category: {insight.category}</span>
                            <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Actionable Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}