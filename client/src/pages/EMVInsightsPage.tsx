import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, TrendingUp, Target, Lightbulb, BarChart3, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function EMVInsightsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const aiFeatures = [
    {
      icon: <Brain className="h-6 w-6 text-blue-500" />,
      title: "Smart Pattern Recognition",
      description: "Our AI agent analyzes your EMV data to identify performance patterns, seasonal trends, and optimization opportunities across different platforms and content types."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: "Performance Forecasting",
      description: "Predicts future EMV performance based on historical data, helping you make informed decisions about content strategy and influencer partnerships."
    },
    {
      icon: <Target className="h-6 w-6 text-purple-500" />,
      title: "Personalized Recommendations",
      description: "Generates tailored suggestions for improving EMV performance, including optimal posting times, content topics, and creator size recommendations."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
      title: "Competitive Analysis",
      description: "Compares your EMV performance against industry benchmarks and provides insights on how to outperform competitors in your niche."
    },
    {
      icon: <Users className="h-6 w-6 text-red-500" />,
      title: "Audience Insights",
      description: "Analyzes engagement patterns to understand which creator sizes and content types resonate best with your target audience."
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
      title: "Strategic Optimization",
      description: "Provides actionable insights on budget allocation, campaign timing, and content strategy to maximize your earned media value."
    }
  ];

  const handleGenerateInsights = () => {
    setIsAnalyzing(true);
    // This would trigger the AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered EMV Insights</h1>
        <p className="mt-2 text-gray-600">
          Advanced artificial intelligence analysis for smarter influencer marketing decisions
        </p>
      </div>

      {/* AI Agent Overview */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-3">About Our AI Agent</h2>
              <p className="text-gray-700 mb-4">
                Our AI agent is powered by advanced machine learning algorithms that analyze your EMV calculation data to provide 
                intelligent insights and recommendations. The system continuously learns from your campaign performance to deliver 
                increasingly accurate predictions and strategic guidance.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Data Privacy Protected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span>Continuous Learning</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {aiFeatures.map((feature, index) => (
          <Card key={index} className="h-full">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Analysis Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Generate AI Insights</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our AI agent will analyze your EMV calculation history to provide personalized insights, 
              trend analysis, and strategic recommendations for optimizing your influencer marketing campaigns.
            </p>
            
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-blue-600">AI agent is analyzing your data...</p>
              </div>
            ) : (
              <Button onClick={handleGenerateInsights} size="lg">
                <Brain className="h-5 w-5 mr-2" />
                Generate AI Insights
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">How Our AI Agent Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <h4 className="font-medium mb-2">Data Collection</h4>
              <p className="text-sm text-gray-600">Gathers your EMV calculations, engagement metrics, and campaign performance data</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-semibold">2</span>
              </div>
              <h4 className="font-medium mb-2">Pattern Analysis</h4>
              <p className="text-sm text-gray-600">Identifies trends, correlations, and performance patterns across different variables</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-semibold">3</span>
              </div>
              <h4 className="font-medium mb-2">Insight Generation</h4>
              <p className="text-sm text-gray-600">Generates actionable insights and recommendations using advanced algorithms</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-semibold">4</span>
              </div>
              <h4 className="font-medium mb-2">Strategic Guidance</h4>
              <p className="text-sm text-gray-600">Delivers personalized recommendations to optimize your future campaigns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}