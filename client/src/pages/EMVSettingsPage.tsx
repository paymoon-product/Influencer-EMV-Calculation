import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Plus, Users, User, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MainLayout } from "@/components/MainLayout";
import { apiRequest } from "@/lib/queryClient";

export default function EMVSettingsPage() {
  // Creator Size Factors
  const [creatorSizeFactors, setCreatorSizeFactors] = useState({
    brand_fan: 0.8,
    nano: 0.9,
    micro: 1.2,
    mid_tier: 1.0,
    macro: 0.95,
    celebrity: 0.9
  });

  // Post Type Factors
  const [postTypeFactors, setPostTypeFactors] = useState({
    instagram_post: 0.9,
    instagram_reel: 1.1,
    instagram_story: 0.8,
    tiktok_video: 1.4,
    youtube_video: 1.1,
    youtube_shorts: 0.9,
    pinterest_pin: 0.7
  });

  // Content Topic Factors
  const [contentTopicFactors, setContentTopicFactors] = useState({
    beauty: 1.3,
    fashion: 1.2,
    fitness: 1.1,
    finance: 0.8,
    food: 1.2,
    game: 0.9,
    music: 1.1,
    travel: 1.1,
    technology: 0.9,
    other: 1.0
  });

  // Base Values
  const [baseValues, setBaseValues] = useState({
    instagram: {
      post: {
        impressions: 0.08,
        likes: 0.2,
        comments: 4.5,
        shares: 3,
        saves: 3.5
      },
      story: {
        impressions: 0.07,
        likes: 0.2,
        shares: 3
      },
      reel: {
        views: 0.12,
        likes: 0.25,
        comments: 5,
        shares: 3,
        saves: 3.5
      }
    },
    tiktok: {
      video: {
        views: 0.08,
        likes: 0.15,
        comments: 2.5,
        shares: 1,
        saves: 1
      }
    },
    youtube: {
      video: {
        views: 0.12,
        likes: 0.9,
        comments: 8.5,
        shares: 3,
        saves: 3
      },
      shorts: {
        views: 0.08,
        likes: 0.15,
        comments: 2.5,
        shares: 1,
        saves: 1
      }
    },
    pinterest: {
      pin: {
        impressions: 0.07,
        clicks: 3.5,
        saves: 3.5,
        closeups: 0.1
      }
    }
  });

  const [customTopics, setCustomTopics] = useState<Array<{name: string, factor: number}>>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicFactor, setNewTopicFactor] = useState(1.0);
  const { toast } = useToast();

  // Load custom topics from database
  const loadCustomTopics = async () => {
    try {
      const response = await fetch('/api/custom-topics');
      const data = await response.json();
      const topics = data.map((topic: any) => ({
        id: topic.id,
        name: topic.name,
        factor: parseFloat(topic.factor)
      }));
      setCustomTopics(topics);
      
      // Immediately update localStorage so calculator can use custom topics
      const currentSettings = JSON.parse(localStorage.getItem('emv-settings') || '{}');
      currentSettings.customTopics = topics;
      localStorage.setItem('emv-settings', JSON.stringify(currentSettings));
    } catch (error) {
      console.error('Error loading custom topics:', error);
    }
  };

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('emv-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.creatorSizeFactors) setCreatorSizeFactors(settings.creatorSizeFactors);
      if (settings.postTypeFactors) setPostTypeFactors(settings.postTypeFactors);
      if (settings.contentTopicFactors) setContentTopicFactors(settings.contentTopicFactors);
      if (settings.baseValues) setBaseValues(settings.baseValues);
    }
    
    // Load custom topics from database
    loadCustomTopics().then(() => {
      // Update localStorage with latest custom topics for EMV calculator
      const currentSettings = JSON.parse(localStorage.getItem('emv-settings') || '{}');
      currentSettings.customTopics = customTopics;
      localStorage.setItem('emv-settings', JSON.stringify(currentSettings));
    });
  }, []);

  const saveAllChanges = () => {
    const settings = {
      creatorSizeFactors,
      postTypeFactors,
      contentTopicFactors,
      baseValues,
      customTopics
    };
    localStorage.setItem('emv-settings', JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "All EMV settings have been saved successfully.",
    });
  };

  const resetToDefaults = () => {
    setCreatorSizeFactors({
      brand_fan: 0.8,
      nano: 0.9,
      micro: 1.2,
      mid_tier: 1.0,
      macro: 0.95,
      celebrity: 0.9
    });
    setPostTypeFactors({
      instagram_post: 0.9,
      instagram_reel: 1.1,
      instagram_story: 0.8,
      tiktok_video: 1.4,
      youtube_video: 1.1,
      youtube_shorts: 0.9,
      pinterest_pin: 0.7
    });
    setContentTopicFactors({
      beauty: 1.3,
      fashion: 1.2,
      fitness: 1.1,
      finance: 0.8,
      food: 1.2,
      game: 0.9,
      music: 1.1,
      travel: 1.1,
      technology: 0.9,
      other: 1.0
    });
    setCustomTopics([]);
    localStorage.removeItem('emv-settings');
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };

  const addCustomTopic = async () => {
    if (!newTopicName.trim()) {
      toast({
        title: "Validation Error",
        description: "Topic name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    if (newTopicFactor <= 0) {
      toast({
        title: "Validation Error", 
        description: "Topic factor must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    // Check if topic already exists
    const existingTopic = Object.keys(contentTopicFactors).find(
      topic => topic.toLowerCase() === newTopicName.toLowerCase()
    );
    const existingCustomTopic = customTopics.find(
      topic => topic.name.toLowerCase() === newTopicName.toLowerCase()
    );

    if (existingTopic || existingCustomTopic) {
      toast({
        title: "Validation Error",
        description: "A topic with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/custom-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTopicName.trim(),
          factor: newTopicFactor
        })
      });
      
      const data = await response.json();
      
      const newTopic = {
        id: data.id,
        name: data.name,
        factor: parseFloat(data.factor)
      };
      
      setCustomTopics([...customTopics, newTopic]);
      setNewTopicName('');
      setNewTopicFactor(1.0);
      
      // Also save to localStorage for EMV calculator
      const settings = JSON.parse(localStorage.getItem('emv-settings') || '{}');
      settings.customTopics = [...customTopics, newTopic];
      localStorage.setItem('emv-settings', JSON.stringify(settings));
      
      toast({
        title: "Topic Added",
        description: `Custom topic "${newTopic.name}" has been saved to database.`,
      });
    } catch (error) {
      console.error('Error adding custom topic:', error);
      toast({
        title: "Error",
        description: "Failed to save custom topic. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeCustomTopic = async (index: number) => {
    const topicToDelete = customTopics[index];
    
    try {
      // Delete from database
      const response = await fetch(`/api/custom-topics/${topicToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from local state
        const updatedTopics = customTopics.filter((_, i) => i !== index);
        setCustomTopics(updatedTopics);
        
        // Update localStorage immediately so dropdown reflects the change
        const currentSettings = JSON.parse(localStorage.getItem('emv-settings') || '{}');
        currentSettings.customTopics = updatedTopics;
        localStorage.setItem('emv-settings', JSON.stringify(currentSettings));
        
        toast({
          title: "Topic Deleted",
          description: `Custom topic "${topicToDelete.name}" has been removed.`,
        });
      } else {
        throw new Error('Failed to delete topic');
      }
    } catch (error) {
      console.error('Error deleting custom topic:', error);
      toast({
        title: "Error",
        description: "Failed to delete custom topic. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateCustomTopic = (index: number, field: string, value: string | number) => {
    const updated = [...customTopics];
    updated[index] = { ...updated[index], [field]: value };
    setCustomTopics(updated);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customize EMV Factors</h1>
        <p className="mt-2 text-gray-600">
          Adjust the EMV calculation factors to match your organization's specific needs and benchmarks.
        </p>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="creator-size" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="creator-size">Creator Size Factors</TabsTrigger>
            <TabsTrigger value="post-type">Post Type Factors</TabsTrigger>
            <TabsTrigger value="content-topic">Content Topic Factors</TabsTrigger>
            <TabsTrigger value="base-values">Base Values</TabsTrigger>
          </TabsList>

          {/* Creator Size Factors Tab */}
          <TabsContent value="creator-size" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Creator Size Factors</h3>
                    <p className="text-gray-600">These factors adjust EMV based on the influencer's audience size.</p>
                    <p className="text-sm text-gray-500 mt-1">Weight Factor</p>
                  </div>
                  <Button onClick={resetToDefaults} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Brand Fan</span>
                      <span className="text-sm text-gray-500">- up to 2.5K followers</span>
                    </div>
                    <Input
                      type="number"
                      step="0.1"
                      value={creatorSizeFactors.brand_fan}
                      onChange={(e) => setCreatorSizeFactors({...creatorSizeFactors, brand_fan: parseFloat(e.target.value) || 0})}
                      className="w-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Nano Creator</span>
                      <span className="text-sm text-gray-500">- 2.5K-25K followers</span>
                    </div>
                    <Input
                      type="number"
                      step="0.1"
                      value={creatorSizeFactors.nano}
                      onChange={(e) => setCreatorSizeFactors({...creatorSizeFactors, nano: parseFloat(e.target.value) || 0})}
                      className="w-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Micro Creator</span>
                      <span className="text-sm text-gray-500">- 25K-60K followers</span>
                    </div>
                    <Input
                      type="number"
                      step="0.1"
                      value={creatorSizeFactors.micro}
                      onChange={(e) => setCreatorSizeFactors({...creatorSizeFactors, micro: parseFloat(e.target.value) || 0})}
                      className="w-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Mid-Tier Creator</span>
                      <span className="text-sm text-gray-500">- 60K-100K followers</span>
                    </div>
                    <Input
                      type="number"
                      step="0.1"
                      value={creatorSizeFactors.mid_tier}
                      onChange={(e) => setCreatorSizeFactors({...creatorSizeFactors, mid_tier: parseFloat(e.target.value) || 0})}
                      className="w-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Macro Creator</span>
                      <span className="text-sm text-gray-500">- 100K-1M followers</span>
                    </div>
                    <Input
                      type="number"
                      step="0.1"
                      value={creatorSizeFactors.macro}
                      onChange={(e) => setCreatorSizeFactors({...creatorSizeFactors, macro: parseFloat(e.target.value) || 0})}
                      className="w-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Celebrity Creator</span>
                      <span className="text-sm text-gray-500">- 1M+ followers</span>
                    </div>
                    <Input
                      type="number"
                      step="0.1"
                      value={creatorSizeFactors.celebrity}
                      onChange={(e) => setCreatorSizeFactors({...creatorSizeFactors, celebrity: parseFloat(e.target.value) || 0})}
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Post Type Factors Tab */}
          <TabsContent value="post-type" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Post Type Factors</h3>
                    <p className="text-gray-600">These factors adjust EMV based on the content format and platform.</p>
                  </div>
                  <Button onClick={resetToDefaults} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Object.entries(postTypeFactors).map(([key, value]) => {
                    const [platform, type] = key.split('_');
                    const displayName = `${platform.charAt(0).toUpperCase() + platform.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
                    
                    return (
                      <div key={key} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{displayName}</h4>
                          <span className="text-sm font-mono">{value}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 w-16">Factor: {value}</span>
                            <div className="flex-1">
                              <Slider
                                value={[value]}
                                onValueChange={(newValue) => setPostTypeFactors({...postTypeFactors, [key]: newValue[0]})}
                                max={5}
                                min={0}
                                step={0.1}
                                className="w-full"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>0</span>
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Topic Factors Tab */}
          <TabsContent value="content-topic" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Content Topic Factors</h3>
                    <p className="text-gray-600">These factors adjust EMV based on the content's subject matter.</p>
                    <p className="text-sm text-gray-500 mt-1">Weight Factor</p>
                  </div>
                  <Button onClick={resetToDefaults} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {Object.entries(contentTopicFactors).map(([topic, factor]) => (
                    <div key={topic} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">{topic}</span>
                      </div>
                      <Input
                        type="number"
                        step="0.1"
                        value={factor}
                        onChange={(e) => setContentTopicFactors({...contentTopicFactors, [topic]: parseFloat(e.target.value) || 0})}
                        className="w-20"
                      />
                    </div>
                  ))}
                </div>

                {/* Add New Topic Form */}
                <div className="border-t pt-4 mt-6">
                  <h4 className="font-medium mb-4">Add Custom Topic</h4>
                  <div className="flex items-center space-x-4 max-w-md">
                    <Input
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      placeholder="Enter topic name (e.g., Sports, Education)"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={newTopicFactor}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value > 0) {
                          setNewTopicFactor(value);
                        }
                      }}
                      className="w-20"
                      placeholder="1.0"
                    />
                    <Button 
                      onClick={addCustomTopic}
                      disabled={!newTopicName.trim() || newTopicFactor <= 0}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter a topic name and factor value, then click "Add" to include it in your calculations.
                  </p>
                </div>

                {customTopics.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Custom Topics</h4>
                    <div className="space-y-3">
                      {customTopics.map((topic, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <Input
                            value={topic.name}
                            onChange={(e) => updateCustomTopic(index, 'name', e.target.value)}
                            placeholder="Topic name"
                            className="w-20"
                          />
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={topic.factor}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (value > 0) {
                                updateCustomTopic(index, 'factor', value);
                              }
                            }}
                            className="w-20"
                          />
                          <Button
                            onClick={() => removeCustomTopic(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Base Values Tab */}
          <TabsContent value="base-values" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Base Engagement Values</h3>
                    <p className="text-gray-600">These are the base monetary values for each type of engagement across different platforms and post types.</p>
                  </div>
                  <Button onClick={resetToDefaults} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>

                <div className="space-y-8">
                  {Object.entries(baseValues).map(([platform, platformData]) => (
                    <div key={platform} className="space-y-4">
                      <h4 className="text-lg font-semibold capitalize flex items-center">
                        {platform}
                      </h4>
                      
                      {Object.entries(platformData).map(([postType, metrics]) => (
                        <div key={postType} className="ml-4 space-y-2">
                          <h5 className="font-medium capitalize">{postType}</h5>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 ml-4">
                            {Object.entries(metrics).map(([metric, value]) => (
                              <div key={metric} className="space-y-1">
                                <Label className="text-sm capitalize">{metric}:</Label>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm">$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={value}
                                    onChange={(e) => {
                                      const newValue = parseFloat(e.target.value) || 0;
                                      setBaseValues(prev => ({
                                        ...prev,
                                        [platform]: {
                                          ...prev[platform],
                                          [postType]: {
                                            ...prev[platform][postType],
                                            [metric]: newValue
                                          }
                                        }
                                      }));
                                    }}
                                    className="w-20"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={saveAllChanges} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}