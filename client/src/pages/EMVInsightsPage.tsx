import { MainLayout } from "@/components/MainLayout";

export default function EMVInsightsPage() {
  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered EMV Insights</h1>
        <p className="mt-2 text-gray-600">
          Personalized analysis and recommendations based on your EMV calculations
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">
          AI Insights feature is being optimized for better performance. 
          This will provide personalized analysis of your EMV calculations once configured.
        </p>
      </div>
    </MainLayout>
  );
}