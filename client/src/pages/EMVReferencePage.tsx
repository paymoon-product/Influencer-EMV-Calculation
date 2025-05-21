import { Card, CardContent } from "@/components/ui/card";
import { EMVReference } from "@/components/EMVReference";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, CloudLightning, Sliders, Settings, BookOpen, Clock } from "lucide-react";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { emvData } from "@/lib/emv-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function EMVReferencePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-primary-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/attached_assets/icon.png" alt="Aspire Logo" className="h-6 w-6" />
            <h1 className="text-xl font-semibold text-primary-900">Aspire EMV Calculator</h1>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
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
        </div>
      </header>
      
      <div className="bg-gray-50 py-2 px-6 border-b border-gray-200">
        <div className="container mx-auto flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Calculator</span>
            </Button>
          </Link>
        </div>
      </div>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-900 mb-2">EMV Reference Values</h2>
            <p className="text-primary-600 mb-6">
              A comprehensive guide to our EMV calculation methodology and reference values.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4">What is EMV?</h3>
                    <p className="text-gray-700 mb-4">
                      Earned Media Value (EMV) is a metric used to estimate the monetary value of organic social media engagement. 
                      It provides a standardized way to measure the impact of influencer content across different platforms.
                    </p>
                    <p className="text-gray-700 mb-4">
                      Our EMV model is based on extensive industry research and updated for 2025 to reflect current market benchmarks
                      and engagement patterns.
                    </p>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4">EMV Calculation Methodology</h3>
                    <p className="text-gray-700 mb-4">
                      Our EMV model uses the following formula:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                      <p className="font-mono text-gray-900">
                        EMV = Σ(Engagement_Type × Base_Value × Creator_Factor × Post_Type_Factor × Topic_Factor)
                      </p>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Each component in the formula contributes to the final EMV:
                    </p>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="engagement-values">
                        <AccordionTrigger className="text-md font-medium text-primary-700">Base Engagement Values</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-700 mb-2">
                            Each type of engagement (likes, comments, shares, etc.) has a base monetary value that varies by platform and post type.
                            These values are based on industry benchmarks and represent the estimated worth of each engagement action.
                          </p>
                          <p className="text-gray-700">
                            For example, comments typically have a higher value than likes because they indicate deeper engagement
                            with the content.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="creator-factors">
                        <AccordionTrigger className="text-md font-medium text-primary-700">Creator Size Factors</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-700 mb-3">
                            The size of an influencer's following affects the value of their engagement. Our model accounts for this with 
                            multipliers based on creator size:
                          </p>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-2 text-left font-medium text-gray-700">Creator Size</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-700">Factor</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {Object.entries(emvData.creatorFactors).map(([size, factor]) => (
                                  <tr key={size}>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                      {size.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">{factor.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-gray-700 mt-3">
                            Note that micro-influencers have the highest factor (1.2) as their engagement is typically more authentic
                            and generates higher engagement rates relative to their audience size.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="post-type-factors">
                        <AccordionTrigger className="text-md font-medium text-primary-700">Post Type Factors</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-700 mb-3">
                            Different content formats have varying levels of impact. Our model uses these multipliers based on post type:
                          </p>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-2 text-left font-medium text-gray-700">Platform & Post Type</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-700">Factor</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {Object.entries(emvData.postTypeFactors).map(([postTypeKey, factor]) => {
                                  const [platform, postType] = postTypeKey.split('_');
                                  return (
                                    <tr key={postTypeKey}>
                                      <td className="px-4 py-2 font-medium text-gray-800">
                                        {platform.charAt(0).toUpperCase() + platform.slice(1)} {postType.charAt(0).toUpperCase() + postType.slice(1)}
                                      </td>
                                      <td className="px-4 py-2 text-gray-700">{factor.toFixed(2)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-gray-700 mt-3">
                            TikTok videos and Instagram Reels have higher factors due to their current popularity and higher engagement rates.
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="topic-factors">
                        <AccordionTrigger className="text-md font-medium text-primary-700">Content Topic Factors</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-700 mb-3">
                            The subject matter of content affects engagement value. Our model uses these topic multipliers:
                          </p>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-2 text-left font-medium text-gray-700">Content Topic</th>
                                  <th className="px-4 py-2 text-left font-medium text-gray-700">Factor</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {Object.entries(emvData.topicFactors).map(([topic, factor]) => (
                                  <tr key={topic}>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                      {topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">{factor.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-gray-700 mt-3">
                            Beauty and fashion content typically generate higher engagement value due to their commercial appeal
                            and higher conversion rates.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-primary-900 mb-4">Example Calculation</h3>
                    <p className="text-gray-700 mb-4">
                      Let's walk through a sample EMV calculation for an Instagram post:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Input Parameters:</h4>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>Platform: Instagram</li>
                        <li>Post Type: Post</li>
                        <li>Creator Size: Micro (25K-60K followers)</li>
                        <li>Content Topic: Beauty</li>
                        <li>Impressions: 50,000</li>
                        <li>Likes: 5,000</li>
                        <li>Comments: 300</li>
                        <li>Shares: 100</li>
                        <li>Saves: 200</li>
                      </ul>
                      
                      <h4 className="font-medium text-gray-900 mt-4 mb-2">Calculation:</h4>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>Creator Factor (Micro): 1.2</li>
                        <li>Post Type Factor (Instagram Post): 1.0</li>
                        <li>Topic Factor (Beauty): 1.3</li>
                        <li>Impressions EMV: 50,000 × $0.08 × 1.2 × 1.0 × 1.3 = $6,240.00</li>
                        <li>Likes EMV: 5,000 × $0.20 × 1.2 × 1.0 × 1.3 = $1,560.00</li>
                        <li>Comments EMV: 300 × $4.50 × 1.2 × 1.0 × 1.3 = $2,106.00</li>
                        <li>Shares EMV: 100 × $3.00 × 1.2 × 1.0 × 1.3 = $468.00</li>
                        <li>Saves EMV: 200 × $3.50 × 1.2 × 1.0 × 1.3 = $1,092.00</li>
                        <li>Total EMV: $11,466.00</li>
                      </ul>
                    </div>
                    <p className="text-gray-700">
                      This example demonstrates how each engagement type contributes to the total EMV, with factors
                      applied to reflect the creator size, post type, and content topic.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                {/* Reference Values Table */}
                <div className="sticky top-6">
                  <EMVReference />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-primary-200 py-4 px-6">
        <div className="container mx-auto text-center text-primary-500 text-sm">
          © {new Date().getFullYear()} Aspire Influencer Marketing Platform | EMV Calculator
        </div>
      </footer>
    </div>
  );
}