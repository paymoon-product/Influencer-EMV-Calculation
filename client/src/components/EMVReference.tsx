import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine } from "lucide-react";
import { emvData } from "@/lib/emv-data";

export function EMVReference() {
  const [showAll, setShowAll] = useState(false);

  const handleDownload = () => {
    // Create CSV content for full reference
    const headers = ["Platform", "Post Type", "Engagement Type", "Base Value", "Description"];
    const rows: string[][] = [];

    // Add base values
    Object.entries(emvData.baseValues).forEach(([platform, postTypes]) => {
      Object.entries(postTypes).forEach(([postType, engagementTypes]) => {
        Object.entries(engagementTypes).forEach(([engagementType, value]) => {
          rows.push([
            platform.charAt(0).toUpperCase() + platform.slice(1),
            postType.charAt(0).toUpperCase() + postType.slice(1),
            engagementType.charAt(0).toUpperCase() + engagementType.slice(1),
            `$${value.toFixed(2)}`,
            `Base value for ${engagementType} on ${platform} ${postType}`,
          ]);
        });
      });
    });

    // Add creator factors
    Object.entries(emvData.creatorFactors).forEach(([creatorSize, factor]) => {
      rows.push([
        "All",
        "All",
        `Creator Size: ${creatorSize.replace("_", " ")}`,
        factor.toFixed(2),
        `Multiplier for ${creatorSize.replace("_", " ")} creators`,
      ]);
    });

    // Add post type factors
    Object.entries(emvData.postTypeFactors).forEach(([postTypeKey, factor]) => {
      const [platform, postType] = postTypeKey.split("_");
      rows.push([
        platform.charAt(0).toUpperCase() + platform.slice(1),
        postType.charAt(0).toUpperCase() + postType.slice(1),
        "Post Type Factor",
        factor.toFixed(2),
        `Multiplier for ${platform} ${postType}`,
      ]);
    });

    // Add topic factors
    Object.entries(emvData.topicFactors).forEach(([topic, factor]) => {
      rows.push([
        "All",
        "All",
        `Topic: ${topic.replace("_", " ")}`,
        factor.toFixed(2),
        `Multiplier for ${topic.replace("_", " ")} content`,
      ]);
    });

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
    link.setAttribute("download", "EMV_Reference_Values.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get a limited set of reference values for display
  const getReferenceData = () => {
    const data: Array<{ platform: string; type: string; value: number }> = [];

    // Instagram post values
    data.push({ platform: "Instagram Post", type: "Impressions", value: emvData.baseValues.instagram.post.impressions });
    data.push({ platform: "Instagram Post", type: "Likes", value: emvData.baseValues.instagram.post.likes });
    data.push({ platform: "Instagram Post", type: "Comments", value: emvData.baseValues.instagram.post.comments });

    // TikTok values
    data.push({ platform: "TikTok", type: "Views", value: emvData.baseValues.tiktok.video.views });
    data.push({ platform: "TikTok", type: "Comments", value: emvData.baseValues.tiktok.video.comments });

    // If showing all, add more data
    if (showAll) {
      // Add more Instagram values
      data.push({ platform: "Instagram Post", type: "Shares", value: emvData.baseValues.instagram.post.shares });
      data.push({ platform: "Instagram Post", type: "Saves", value: emvData.baseValues.instagram.post.saves });
      
      // Instagram Stories
      data.push({ platform: "Instagram Story", type: "Impressions", value: emvData.baseValues.instagram.story.impressions });
      data.push({ platform: "Instagram Story", type: "Likes", value: emvData.baseValues.instagram.story.likes });
      data.push({ platform: "Instagram Story", type: "Shares", value: emvData.baseValues.instagram.story.shares });
      
      // Instagram Reels
      data.push({ platform: "Instagram Reel", type: "Views", value: emvData.baseValues.instagram.reel.views });
      data.push({ platform: "Instagram Reel", type: "Likes", value: emvData.baseValues.instagram.reel.likes });
      data.push({ platform: "Instagram Reel", type: "Comments", value: emvData.baseValues.instagram.reel.comments });
      
      // TikTok additional metrics
      data.push({ platform: "TikTok", type: "Likes", value: emvData.baseValues.tiktok.video.likes });
      data.push({ platform: "TikTok", type: "Shares", value: emvData.baseValues.tiktok.video.shares });
      data.push({ platform: "TikTok", type: "Saves", value: emvData.baseValues.tiktok.video.saves });
      
      // YouTube
      data.push({ platform: "YouTube Video", type: "Views", value: emvData.baseValues.youtube.video.views });
      data.push({ platform: "YouTube Video", type: "Likes", value: emvData.baseValues.youtube.video.likes });
      data.push({ platform: "YouTube Video", type: "Comments", value: emvData.baseValues.youtube.video.comments });
      data.push({ platform: "YouTube Shorts", type: "Views", value: emvData.baseValues.youtube.shorts.views });
      
      // Pinterest
      data.push({ platform: "Pinterest", type: "Impressions", value: emvData.baseValues.pinterest.pin.impressions });
      data.push({ platform: "Pinterest", type: "Clicks", value: emvData.baseValues.pinterest.pin.clicks });
      data.push({ platform: "Pinterest", type: "Saves", value: emvData.baseValues.pinterest.pin.saves });
    }

    return data;
  };

  const referenceData = getReferenceData();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-900">EMV Reference Values</h3>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <ArrowDownToLine className="h-4 w-4 mr-1" />
            Download Full Reference
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3">Platform</th>
                <th scope="col" className="px-4 py-3">Engagement Type</th>
                <th scope="col" className="px-4 py-3">Base Value</th>
              </tr>
            </thead>
            <tbody>
              {referenceData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "border-b border-gray-100" : "border-b border-gray-100 bg-gray-50"}>
                  <td className="px-4 py-2 font-medium">{item.platform}</td>
                  <td className="px-4 py-2">{item.type}</td>
                  <td className="px-4 py-2">${item.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <Button 
            variant="link" 
            className="text-gray-500 hover:text-gray-600 text-sm font-medium"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : "View All Values"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
