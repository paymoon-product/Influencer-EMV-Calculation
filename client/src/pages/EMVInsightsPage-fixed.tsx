import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Lightbulb, AlertTriangle, 
  BarChart3, Target, Sparkles, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MainLayout } from "@/components/MainLayout";

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
  const [insights, setInsights] = useState<InsightsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest({
        endpoint: '/api/emv/insights',
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to insights service.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered EMV Insights</h1>
          <p className="mt-2 text-gray-600">
            Personalized analysis and recommendations based on your EMV calculations
          </p>
        </div>
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Sparkles className="h-8 w-8 animate-pulse text-primary mb-4" />
            <p className="text-gray-600">Analyzing your EMV data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered EMV Insights</h1>
          <p className="mt-2 text-gray-600">
            Personalized analysis and recommendations based on your EMV calculations
          </p>
        </div>
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchInsights} className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!insights) {
    return (
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered EMV Insights</h1>
          <p className="mt-2 text-gray-600">
            Personalized analysis and recommendations based on your EMV calculations
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No insights available</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered EMV Insights</h1>
        <p className="mt-2 text-gray-600">
          Personalized analysis and recommendations based on your EMV calculations
        </p>
      </div>

      <div className="space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>Executive Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Key Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">${insights.keyMetrics.totalEmv.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total EMV</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${insights.keyMetrics.averageEmv.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Average EMV</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{insights.keyMetrics.topPerformingPlatform}</div>
                <div className="text-sm text-gray-600">Top Platform</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        {insights.insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getTypeColor(insight.type)} variant="outline">
                          {insight.type}
                        </Badge>
                        <Badge className={getImpactColor(insight.impact)} variant="outline">
                          {insight.impact} impact
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-700">{insight.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Confidence: {Math.round(insight.confidence * 100)}%
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
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-indigo-600" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button onClick={fetchInsights} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Insights</span>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}