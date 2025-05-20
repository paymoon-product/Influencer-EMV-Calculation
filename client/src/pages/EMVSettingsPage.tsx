import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emvData } from "@/lib/emv-data";

export default function EMVSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("creator");

  // Initialize state with deep copies of the emvData factors
  const [creatorFactors, setCreatorFactors] = useState<Record<string, number>>({});
  const [postTypeFactors, setPostTypeFactors] = useState<Record<string, number>>({});
  const [topicFactors, setTopicFactors] = useState<Record<string, number>>({});
  
  // Load saved settings or use defaults
  useEffect(() => {
    // Try to get values from localStorage
    const savedCreatorFactors = localStorage.getItem("emv-creator-factors");
    const savedPostTypeFactors = localStorage.getItem("emv-post-type-factors");
    const savedTopicFactors = localStorage.getItem("emv-topic-factors");
    
    // Set state with saved values or defaults
    setCreatorFactors(savedCreatorFactors ? JSON.parse(savedCreatorFactors) : {...emvData.creatorFactors});
    setPostTypeFactors(savedPostTypeFactors ? JSON.parse(savedPostTypeFactors) : {...emvData.postTypeFactors});
    setTopicFactors(savedTopicFactors ? JSON.parse(savedTopicFactors) : {...emvData.topicFactors});
  }, []);

  // Handle save settings
  const saveSettings = () => {
    // Validate all factors to ensure they're positive numbers
    const validateFactors = (factors: Record<string, number>): boolean => {
      return Object.values(factors).every(value => !isNaN(value) && value >= 0);
    };

    if (!validateFactors(creatorFactors) || !validateFactors(postTypeFactors) || !validateFactors(topicFactors)) {
      toast({
        title: "Invalid Values",
        description: "All factors must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem("emv-creator-factors", JSON.stringify(creatorFactors));
    localStorage.setItem("emv-post-type-factors", JSON.stringify(postTypeFactors));
    localStorage.setItem("emv-topic-factors", JSON.stringify(topicFactors));

    // Show success toast
    toast({
      title: "Settings Saved",
      description: "Your custom EMV factors have been saved",
    });
  };

  // Handle reset to defaults
  const resetToDefaults = (factorType: 'creator' | 'postType' | 'topic') => {
    switch (factorType) {
      case 'creator':
        setCreatorFactors({...emvData.creatorFactors});
        localStorage.removeItem("emv-creator-factors");
        break;
      case 'postType':
        setPostTypeFactors({...emvData.postTypeFactors});
        localStorage.removeItem("emv-post-type-factors");
        break;
      case 'topic':
        setTopicFactors({...emvData.topicFactors});
        localStorage.removeItem("emv-topic-factors");
        break;
    }

    toast({
      title: "Reset Complete",
      description: `${factorType.charAt(0).toUpperCase() + factorType.slice(1)} factors reset to default values`,
    });
  };

  // Handle input change
  const handleFactorChange = (
    key: string, 
    value: string, 
    setFactorFunction: React.Dispatch<React.SetStateAction<Record<string, number>>>,
    factorObject: Record<string, number>
  ) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFactorFunction({
        ...factorObject,
        [key]: numValue
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-primary-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Calculator</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-primary-900">EMV Settings</h1>
          <div>
            <Button 
              onClick={saveSettings}
              className="inline-flex items-center space-x-1"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-primary-900 mb-2">Customize EMV Factors</h2>
            <p className="text-primary-600 mb-6">
              Adjust the EMV calculation factors to match your organization's specific needs and benchmarks.
            </p>

            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="creator" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="creator">Creator Size Factors</TabsTrigger>
                    <TabsTrigger value="postType">Post Type Factors</TabsTrigger>
                    <TabsTrigger value="topic">Content Topic Factors</TabsTrigger>
                  </TabsList>

                  <TabsContent value="creator" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-primary-800">Creator Size Factors</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => resetToDefaults('creator')}
                        className="flex items-center space-x-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Reset to Default</span>
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      These factors adjust EMV based on the influencer's audience size.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(creatorFactors).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={`creator-${key}`}>
                            {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <Input
                            id={`creator-${key}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={value}
                            onChange={(e) => handleFactorChange(key, e.target.value, setCreatorFactors, creatorFactors)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="postType" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-primary-800">Post Type Factors</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => resetToDefaults('postType')}
                        className="flex items-center space-x-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Reset to Default</span>
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      These factors adjust EMV based on the content format and platform.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(postTypeFactors).map(([key, value]) => {
                        const [platform, postType] = key.split('_');
                        return (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={`post-type-${key}`}>
                              {platform.charAt(0).toUpperCase() + platform.slice(1)} {postType.charAt(0).toUpperCase() + postType.slice(1)}
                            </Label>
                            <Input
                              id={`post-type-${key}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={value}
                              onChange={(e) => handleFactorChange(key, e.target.value, setPostTypeFactors, postTypeFactors)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="topic" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-primary-800">Content Topic Factors</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => resetToDefaults('topic')}
                        className="flex items-center space-x-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Reset to Default</span>
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      These factors adjust EMV based on the content's subject matter.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(topicFactors).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={`topic-${key}`}>
                            {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <Input
                            id={`topic-${key}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={value}
                            onChange={(e) => handleFactorChange(key, e.target.value, setTopicFactors, topicFactors)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
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