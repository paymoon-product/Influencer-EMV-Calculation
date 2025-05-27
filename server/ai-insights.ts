import Anthropic from '@anthropic-ai/sdk';
import { EmvCalculation, EmvResult } from '@shared/schema';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface TrendInsight {
  id: string;
  type: 'trend' | 'recommendation' | 'optimization' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'platform' | 'content' | 'timing' | 'audience' | 'general';
  actionable: boolean;
  confidence: number;
}

export interface InsightsReport {
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

export async function generatePersonalizedInsights(calculations: EmvCalculation[]): Promise<InsightsReport> {
  if (!calculations || calculations.length === 0) {
    throw new Error('No calculation data available for analysis');
  }

  // Prepare data for AI analysis
  const analysisData = {
    totalCalculations: calculations.length,
    calculations: calculations.map(calc => {
      const params = calc.parameters as any;
      const result = calc.result as any;
      return {
        date: calc.date,
        platform: params.platform,
        postType: params.postType,
        creatorSize: params.creatorSize,
        contentTopic: params.contentTopic,
        totalEmv: result.totalEMV,
        creatorFactor: result.creatorFactor,
        topicFactor: result.topicFactor,
        postTypeFactor: result.postTypeFactor
      };
    }),
    timeRange: {
      start: calculations[calculations.length - 1]?.date,
      end: calculations[0]?.date
    }
  };

  const prompt = `Analyze this EMV (Earned Media Value) calculation data and provide personalized insights for an influencer marketing professional. 

Data Summary:
- Total calculations: ${analysisData.totalCalculations}
- Date range: ${analysisData.timeRange.start} to ${analysisData.timeRange.end}

Historical EMV Data:
${JSON.stringify(analysisData.calculations, null, 2)}

Please provide insights in the following JSON format:
{
  "summary": "A 2-3 sentence overview of the key findings",
  "insights": [
    {
      "id": "unique-id",
      "type": "trend|recommendation|optimization|warning",
      "title": "Brief insight title",
      "description": "Detailed explanation",
      "impact": "high|medium|low",
      "category": "platform|content|timing|audience|general",
      "actionable": true|false,
      "confidence": 0.0-1.0
    }
  ],
  "keyMetrics": {
    "totalEmv": total_emv_sum,
    "averageEmv": average_emv,
    "topPerformingPlatform": "platform_name",
    "topPerformingContent": "content_type",
    "growthRate": percentage_change
  },
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"]
}

Focus on:
1. Platform performance trends
2. Content type effectiveness
3. Creator size optimization
4. Topic performance patterns
5. Timing and seasonal insights
6. ROI optimization opportunities

Provide specific, actionable insights based on the actual data patterns.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from AI service');
    }

    // Clean the response text to extract JSON from markdown blocks
    let responseText = content.text;
    if (responseText.includes('```json')) {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        responseText = jsonMatch[1].trim();
      } else {
        responseText = responseText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      }
    }
    
    const insights = JSON.parse(responseText) as InsightsReport;
    return insights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    throw new Error('Failed to generate personalized insights. Please try again.');
  }
}

export async function generateSingleCalculationInsight(calculation: EmvCalculation): Promise<string> {
  const params = calculation.parameters as any;
  const result = calculation.result as any;
  
  const prompt = `Analyze this single EMV calculation and provide a brief insight:

Platform: ${params.platform}
Post Type: ${params.postType}
Creator Size: ${params.creatorSize}
Content Topic: ${params.contentTopic}
Total EMV: $${result.totalEMV}
Creator Factor: ${result.creatorFactor}
Topic Factor: ${result.topicFactor}

Provide a 1-2 sentence insight about this calculation's performance and potential optimization.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from AI service');
    }

    return content.text;
  } catch (error) {
    console.error('Error generating single calculation insight:', error);
    return 'Unable to generate insight for this calculation at the moment.';
  }
}