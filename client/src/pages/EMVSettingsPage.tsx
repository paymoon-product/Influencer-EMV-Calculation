import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emvData } from "@/lib/emv-data";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

export default function EMVSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("creator");

  // Initialize state with deep copies of the emvData factors
  const [creatorFactors, setCreatorFactors] = useState<Record<string, number>>({});
  const [postTypeFactors, setPostTypeFactors] = useState<Record<string, number>>({});
  const [topicFactors, setTopicFactors] = useState<Record<string, number>>({});
  const [baseValues, setBaseValues] = useState<Record<string, Record<string, Record<string, number>>>>({});
  
  // Custom topic state
  const [customTopics, setCustomTopics] = useState<Record<string, number>>({});
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicWeight, setNewTopicWeight] = useState(1.0);
  const [showAddTopicDialog, setShowAddTopicDialog] = useState(false);
  
  // Load saved settings or use defaults
  useEffect(() => {
    // Try to get values from localStorage
    const savedCreatorFactors = localStorage.getItem("emv-creator-factors");
    const savedPostTypeFactors = localStorage.getItem("emv-post-type-factors");
    const savedTopicFactors = localStorage.getItem("emv-topic-factors");
    const savedBaseValues = localStorage.getItem("emv-base-values");
    const savedCustomTopics = localStorage.getItem("emv-custom-topics");
    
    // Set state with saved values or defaults
    setCreatorFactors(savedCreatorFactors ? JSON.parse(savedCreatorFactors) : {...emvData.creatorFactors});
    setPostTypeFactors(savedPostTypeFactors ? JSON.parse(savedPostTypeFactors) : {...emvData.postTypeFactors});
    setTopicFactors(savedTopicFactors ? JSON.parse(savedTopicFactors) : {...emvData.topicFactors});
    setBaseValues(savedBaseValues ? JSON.parse(savedBaseValues) : {...emvData.baseValues});
    setCustomTopics(savedCustomTopics ? JSON.parse(savedCustomTopics) : {});
  }, []);

  // Handle save settings
  const saveSettings = () => {
    // Validate all factors to ensure they're positive numbers
    const validateFactors = (factors: Record<string, number>): boolean => {
      return Object.values(factors).every(value => !isNaN(value) && value >= 0);
    };

    if (!validateFactors(creatorFactors) || !validateFactors(postTypeFactors) || !validateFactors({...topicFactors, ...customTopics})) {
      toast({
        title: "Invalid Values",
        description: "All factors must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    // Validate base values
    let validBaseValues = true;
    try {
      Object.values(baseValues).forEach(platform => {
        Object.values(platform).forEach(postType => {
          Object.values(postType).forEach(value => {
            if (isNaN(value) || value < 0) {
              validBaseValues = false;
            }
          });
        });
      });
    } catch (error) {
      validBaseValues = false;
    }

    if (!validBaseValues) {
      toast({
        title: "Invalid Base Values",
        description: "All base values must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem("emv-creator-factors", JSON.stringify(creatorFactors));
    localStorage.setItem("emv-post-type-factors", JSON.stringify(postTypeFactors));
    localStorage.setItem("emv-topic-factors", JSON.stringify(topicFactors));
    localStorage.setItem("emv-base-values", JSON.stringify(baseValues));
    localStorage.setItem("emv-custom-topics", JSON.stringify(customTopics));

    // Show success toast
    toast({
      title: "Settings Saved",
      description: "Your custom EMV factors have been saved",
    });
  };

  // Handle reset to defaults
  const resetToDefaults = (factorType: 'creator' | 'postType' | 'topic' | 'baseValues') => {
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
      case 'baseValues':
        setBaseValues({...emvData.baseValues});
        localStorage.removeItem("emv-base-values");
        break;
    }

    toast({
      title: "Reset Complete",
      description: `${factorType === 'baseValues' ? 'Base values' : factorType.charAt(0).toUpperCase() + factorType.slice(1) + ' factors'} reset to default values`,
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

  // Handle base value change
  const handleBaseValueChange = (
    platform: string,
    postType: string,
    engagementType: string,
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setBaseValues(prev => {
        const newState = {...prev};
        if (!newState[platform]) newState[platform] = {};
        if (!newState[platform][postType]) newState[platform][postType] = {};
        newState[platform][postType][engagementType] = numValue;
        return newState;
      });
    }
  };

  // Handle adding a new custom topic
  const handleAddCustomTopic = () => {
    if (!newTopicName.trim()) {
      toast({
        title: "Error",
        description: "Topic name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Convert name to lowercase with underscores
    const key = newTopicName.trim().toLowerCase().replace(/\s+/g, '_');
    
    // Check if topic already exists
    if (topicFactors[key] !== undefined || customTopics[key] !== undefined) {
      toast({
        title: "Error",
        description: "This topic already exists",
        variant: "destructive",
      });
      return;
    }

    setCustomTopics(prev => ({
      ...prev,
      [key]: newTopicWeight
    }));

    setNewTopicName("");
    setNewTopicWeight(1.0);
    setShowAddTopicDialog(false);

    toast({
      title: "Topic Added",
      description: "Your custom topic has been added",
    });
  };

  // Handle removing a custom topic
  const handleRemoveCustomTopic = (key: string) => {
    const newCustomTopics = {...customTopics};
    delete newCustomTopics[key];
    setCustomTopics(newCustomTopics);

    toast({
      title: "Topic Removed",
      description: "Your custom topic has been removed",
    });
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
          <div></div>
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
                    <TabsTrigger value="baseValues">Base Values</TabsTrigger>
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
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowAddTopicDialog(true)}
                          className="flex items-center space-x-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Topic</span>
                        </Button>
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
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      These factors adjust EMV based on the content's subject matter.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(topicFactors).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={`topic-${key}`}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

                    {Object.keys(customTopics).length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <h4 className="text-md font-medium text-primary-800 mb-4">Custom Topics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(customTopics).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex justify-between">
                                <Label htmlFor={`custom-topic-${key}`}>
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Label>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveCustomTopic(key)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </div>
                              <Input
                                id={`custom-topic-${key}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={value}
                                onChange={(e) => handleFactorChange(key, e.target.value, setCustomTopics, customTopics)}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="baseValues" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-primary-800">Base Engagement Values</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => resetToDefaults('baseValues')}
                        className="flex items-center space-x-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Reset to Default</span>
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      These are the base monetary values for each type of engagement across different platforms and post types.
                    </p>

                    {Object.entries(baseValues).map(([platform, postTypes]) => (
                      <div key={platform} className="mb-8">
                        <h4 className="text-md font-medium text-primary-800 capitalize mb-4">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </h4>
                        
                        {Object.entries(postTypes).map(([postType, engagementTypes]) => (
                          <div key={`${platform}-${postType}`} className="mb-6">
                            <h5 className="text-sm font-medium text-primary-700 capitalize mb-3">
                              {postType.charAt(0).toUpperCase() + postType.slice(1)}
                            </h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {Object.entries(engagementTypes).map(([engType, value]) => (
                                <div key={`${platform}-${postType}-${engType}`} className="space-y-2">
                                  <Label htmlFor={`base-${platform}-${postType}-${engType}`} className="capitalize">
                                    {engType.charAt(0).toUpperCase() + engType.slice(1)}
                                  </Label>
                                  <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                      $
                                    </span>
                                    <Input
                                      id={`base-${platform}-${postType}-${engType}`}
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={value}
                                      onChange={(e) => handleBaseValueChange(platform, postType, engType, e.target.value)}
                                      className="rounded-l-none"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <Separator className="my-4" />
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Save button at the bottom right */}
            <div className="flex justify-end mt-6">
              <Button 
                onClick={saveSettings}
                className="inline-flex items-center space-x-1"
              >
                <Save className="h-4 w-4 mr-1" />
                <span>Save All Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Topic Dialog */}
      <Dialog open={showAddTopicDialog} onOpenChange={setShowAddTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-topic-name">Topic Name</Label>
              <Input
                id="new-topic-name"
                placeholder="Enter topic name"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-topic-weight">Weight Factor</Label>
              <Input
                id="new-topic-weight"
                type="number"
                step="0.1"
                min="0"
                value={newTopicWeight}
                onChange={(e) => setNewTopicWeight(parseFloat(e.target.value) || 1.0)}
              />
              <p className="text-xs text-gray-500">
                Weight determines how much this topic impacts the EMV calculation.
                1.0 is the baseline (neutral), higher values increase EMV, lower values decrease it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTopicDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomTopic}>
              Add Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="bg-white border-t border-primary-200 py-4 px-6">
        <div className="container mx-auto text-center text-primary-500 text-sm">
          © {new Date().getFullYear()} Aspire Influencer Marketing Platform | EMV Calculator
        </div>
      </footer>
    </div>
  );
}