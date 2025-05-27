import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Save, RotateCcw, Plus, Trash2, Users, Layout,
  BookOpen, PenTool, Settings, Clock, CloudLightning, Sliders, Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { emvData } from "@/lib/emv-data";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  FaInstagram, FaTiktok, FaYoutube, FaPinterest,
  FaRegUser, FaUserFriends, FaUsers, FaUserTie, FaUserCheck,
  FaRegLightbulb, FaHashtag
} from "react-icons/fa";
import { 
  FaSpa as BeautyIcon, FaTshirt as FashionIcon, FaRunning as FitnessIcon,
  FaMoneyBillWave as FinanceIcon, FaUtensils as FoodIcon,
  FaGamepad as GameIcon, FaMusic as MusicIcon,
  FaPlane as TravelIcon, FaMobileAlt as TechnologyIcon,
  FaEllipsisH as OtherIcon
} from "react-icons/fa";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { AppHeader } from "@/components/AppHeader";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
            <DropdownMenuItem>
              <Link href="/insights" className="flex items-center w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>AI Insights</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
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

                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 mb-0">Weight Factor</p>

                      {/* First row: Brand Fan, Nano, Micro */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['brand_fan', 'nano', 'micro'].map(key => {
                          if (!creatorFactors[key]) return null;
                          const value = creatorFactors[key];
                          
                          // Determine icon and follower range based on creator size
                          let icon;
                          let followerRange;
                          
                          switch(key) {
                            case 'brand_fan':
                              icon = <FaRegUser className="text-gray-500" />;
                              followerRange = "< 1K followers";
                              break;
                            case 'nano':
                              icon = <FaRegUser className="text-blue-500" />;
                              followerRange = "1K-10K followers";
                              break;
                            case 'micro':
                              icon = <FaUserFriends className="text-green-500" />;
                              followerRange = "10K-50K followers";
                              break;
                          }
                          
                          return (
                            <div key={key} className="space-y-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="text-xl">{icon}</div>
                                <Label htmlFor={`creator-${key}`} className="text-sm font-medium">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  <span className="ml-2 text-xs text-gray-500">{followerRange}</span>
                                </Label>
                              </div>
                              <div className="flex items-center">
                                <Input
                                  id={`creator-${key}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={value}
                                  className="w-20"
                                  onChange={(e) => handleFactorChange(key, e.target.value, setCreatorFactors, creatorFactors)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Second row: Mid Tier, Macro, Celebrity */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['mid_tier', 'macro', 'celebrity'].map(key => {
                          if (!creatorFactors[key]) return null;
                          const value = creatorFactors[key];
                          
                          // Determine icon and follower range based on creator size
                          let icon;
                          let followerRange;
                          
                          switch(key) {
                            case 'mid_tier':
                              icon = <FaUsers className="text-yellow-500" />;
                              followerRange = "50K-500K followers";
                              break;
                            case 'macro':
                              icon = <FaUserTie className="text-orange-500" />;
                              followerRange = "500K-1M followers";
                              break;
                            case 'celebrity':
                              icon = <FaUserCheck className="text-red-500" />;
                              followerRange = "1M+ followers";
                              break;
                          }
                          
                          return (
                            <div key={key} className="space-y-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="text-xl">{icon}</div>
                                <Label htmlFor={`creator-${key}`} className="text-sm font-medium">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  <span className="ml-2 text-xs text-gray-500">{followerRange}</span>
                                </Label>
                              </div>
                              <div className="flex items-center">
                                <Input
                                  id={`creator-${key}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={value}
                                  className="w-20"
                                  onChange={(e) => handleFactorChange(key, e.target.value, setCreatorFactors, creatorFactors)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
                        
                        // Determine platform icon
                        let platformIcon;
                        switch(platform) {
                          case 'instagram':
                            platformIcon = <FaInstagram className="text-pink-500" />;
                            break;
                          case 'tiktok':
                            platformIcon = <FaTiktok className="text-black" />;
                            break;
                          case 'youtube':
                            platformIcon = <FaYoutube className="text-red-600" />;
                            break;
                          case 'pinterest':
                            platformIcon = <FaPinterest className="text-red-500" />;
                            break;
                          default:
                            platformIcon = <FaHashtag />;
                        }

                        // Handle slider value change
                        const handleSliderChange = (newValue: number[]) => {
                          handleFactorChange(key, newValue[0].toString(), setPostTypeFactors, postTypeFactors);
                        };
                        
                        return (
                          <div key={key} className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-2">
                              <div className="text-xl">{platformIcon}</div>
                              <Label htmlFor={`post-type-${key}`} className="text-sm font-medium">
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}{' '}
                                <span className="font-bold">{postType.charAt(0).toUpperCase() + postType.slice(1)}</span>
                              </Label>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Factor: {value}</span>
                                <Input
                                  id={`post-type-${key}`}
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="5"
                                  value={value}
                                  className="w-20"
                                  onChange={(e) => handleFactorChange(key, e.target.value, setPostTypeFactors, postTypeFactors)}
                                />
                              </div>
                              
                              <Slider 
                                defaultValue={[value]} 
                                max={5} 
                                step={0.1}
                                value={[value]}
                                onValueChange={handleSliderChange}
                              />
                              <div className="flex justify-between text-xs text-gray-500">
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

                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 mb-0">Weight Factor</p>
                      
                      {/* Create arrays of topics to display in rows of 5 */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Object.entries(topicFactors).slice(0, 5).map(([key, value]) => {
                          // Determine topic icon
                          let topicIcon;
                          switch(key) {
                            case 'beauty':
                              topicIcon = <FaRegLightbulb className="text-pink-400" />;
                              break;
                            case 'fashion':
                              topicIcon = <FashionIcon className="text-purple-500" />;
                              break;
                            case 'fitness':
                              topicIcon = <FitnessIcon className="text-green-500" />;
                              break;
                            case 'finance':
                              topicIcon = <FinanceIcon className="text-blue-500" />;
                              break;
                            case 'food':
                              topicIcon = <FoodIcon className="text-orange-400" />;
                              break;
                            case 'game':
                              topicIcon = <GameIcon className="text-red-400" />;
                              break;
                            case 'music':
                              topicIcon = <MusicIcon className="text-indigo-400" />;
                              break;
                            case 'travel':
                              topicIcon = <TravelIcon className="text-blue-400" />;
                              break;
                            case 'technology':
                              topicIcon = <TechnologyIcon className="text-gray-700" />;
                              break;
                            case 'other':
                              topicIcon = <OtherIcon className="text-gray-500" />;
                              break;
                            default:
                              topicIcon = <FaHashtag className="text-gray-400" />;
                          }
                          
                          return (
                            <div key={key} className="space-y-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="text-xl">{topicIcon}</div>
                                <Label htmlFor={`topic-${key}`} className="text-sm font-medium">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Label>
                              </div>
                              <div className="flex items-center">
                                <Input
                                  id={`topic-${key}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={value}
                                  className="w-20"
                                  onChange={(e) => handleFactorChange(key, e.target.value, setTopicFactors, topicFactors)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Second row of topics */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Object.entries(topicFactors).slice(5, 10).map(([key, value]) => {
                          // Determine topic icon
                          let topicIcon;
                          switch(key) {
                            case 'beauty':
                              topicIcon = <FaRegLightbulb className="text-pink-400" />;
                              break;
                            case 'fashion':
                              topicIcon = <FashionIcon className="text-purple-500" />;
                              break;
                            case 'fitness':
                              topicIcon = <FitnessIcon className="text-green-500" />;
                              break;
                            case 'finance':
                              topicIcon = <FinanceIcon className="text-blue-500" />;
                              break;
                            case 'food':
                              topicIcon = <FoodIcon className="text-orange-400" />;
                              break;
                            case 'game':
                              topicIcon = <GameIcon className="text-red-400" />;
                              break;
                            case 'music':
                              topicIcon = <MusicIcon className="text-indigo-400" />;
                              break;
                            case 'travel':
                              topicIcon = <TravelIcon className="text-blue-400" />;
                              break;
                            case 'technology':
                              topicIcon = <TechnologyIcon className="text-gray-700" />;
                              break;
                            case 'other':
                              topicIcon = <OtherIcon className="text-gray-500" />;
                              break;
                            default:
                              topicIcon = <FaHashtag className="text-gray-400" />;
                          }
                          
                          return (
                            <div key={key} className="space-y-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="text-xl">{topicIcon}</div>
                                <Label htmlFor={`topic-${key}`} className="text-sm font-medium">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Label>
                              </div>
                              <div className="flex items-center">
                                <Input
                                  id={`topic-${key}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={value}
                                  className="w-20"
                                  onChange={(e) => handleFactorChange(key, e.target.value, setTopicFactors, topicFactors)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {Object.keys(customTopics).length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <h4 className="text-md font-medium text-primary-800 mb-4">Custom Topics</h4>
                        <p className="text-sm text-gray-500 mb-0">Weight Factor</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                          {Object.entries(customTopics).map(([key, value]) => (
                            <div key={key} className="space-y-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="text-xl"><FaHashtag className="text-gray-400" /></div>
                                <Label htmlFor={`custom-topic-${key}`} className="text-sm font-medium">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id={`custom-topic-${key}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={value}
                                  className="w-20"
                                  onChange={(e) => handleFactorChange(key, e.target.value, setCustomTopics, customTopics)}
                                />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveCustomTopic(key)}
                                  className="h-8 px-2 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </div>
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

                    <div className="space-y-8">
                      {/* Instagram */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="text-xl text-pink-500"><FaInstagram /></div>
                          <h4 className="text-md font-medium text-primary-800">Instagram</h4>
                        </div>
                        
                        <div className="space-y-6">
                          {Object.entries(baseValues.instagram || {}).map(([postType, engagementTypes]) => (
                            <div key={`instagram-${postType}`} className="space-y-2">
                              <h5 className="text-sm font-medium text-primary-700 capitalize border-b pb-1">
                                {postType.charAt(0).toUpperCase() + postType.slice(1)}
                              </h5>
                              
                              <div className="flex flex-wrap gap-3">
                                {Object.entries(engagementTypes).map(([engType, value]) => (
                                  <div key={`instagram-${postType}-${engType}`} className="flex items-center space-x-1">
                                    <Label htmlFor={`base-instagram-${postType}-${engType}`} className="capitalize text-xs min-w-24">
                                      {engType.charAt(0).toUpperCase() + engType.slice(1)}:
                                    </Label>
                                    <div className="flex items-center">
                                      <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm h-9">
                                        $
                                      </span>
                                      <Input
                                        id={`base-instagram-${postType}-${engType}`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={value}
                                        onChange={(e) => handleBaseValueChange("instagram", postType, engType, e.target.value)}
                                        className="rounded-l-none w-24 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* TikTok */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="text-xl text-black"><FaTiktok /></div>
                          <h4 className="text-md font-medium text-primary-800">TikTok</h4>
                        </div>
                        
                        <div className="space-y-6">
                          {Object.entries(baseValues.tiktok || {}).map(([postType, engagementTypes]) => (
                            <div key={`tiktok-${postType}`} className="space-y-2">
                              <h5 className="text-sm font-medium text-primary-700 capitalize border-b pb-1">
                                {postType.charAt(0).toUpperCase() + postType.slice(1)}
                              </h5>
                              
                              <div className="flex flex-wrap gap-3">
                                {Object.entries(engagementTypes).map(([engType, value]) => (
                                  <div key={`tiktok-${postType}-${engType}`} className="flex items-center space-x-1">
                                    <Label htmlFor={`base-tiktok-${postType}-${engType}`} className="capitalize text-xs min-w-24">
                                      {engType.charAt(0).toUpperCase() + engType.slice(1)}:
                                    </Label>
                                    <div className="flex items-center">
                                      <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm h-9">
                                        $
                                      </span>
                                      <Input
                                        id={`base-tiktok-${postType}-${engType}`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={value}
                                        onChange={(e) => handleBaseValueChange("tiktok", postType, engType, e.target.value)}
                                        className="rounded-l-none w-24 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* YouTube */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="text-xl text-red-600"><FaYoutube /></div>
                          <h4 className="text-md font-medium text-primary-800">YouTube</h4>
                        </div>
                        
                        <div className="space-y-6">
                          {Object.entries(baseValues.youtube || {}).map(([postType, engagementTypes]) => (
                            <div key={`youtube-${postType}`} className="space-y-2">
                              <h5 className="text-sm font-medium text-primary-700 capitalize border-b pb-1">
                                {postType.charAt(0).toUpperCase() + postType.slice(1)}
                              </h5>
                              
                              <div className="flex flex-wrap gap-3">
                                {Object.entries(engagementTypes).map(([engType, value]) => (
                                  <div key={`youtube-${postType}-${engType}`} className="flex items-center space-x-1">
                                    <Label htmlFor={`base-youtube-${postType}-${engType}`} className="capitalize text-xs min-w-24">
                                      {engType.charAt(0).toUpperCase() + engType.slice(1)}:
                                    </Label>
                                    <div className="flex items-center">
                                      <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm h-9">
                                        $
                                      </span>
                                      <Input
                                        id={`base-youtube-${postType}-${engType}`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={value}
                                        onChange={(e) => handleBaseValueChange("youtube", postType, engType, e.target.value)}
                                        className="rounded-l-none w-24 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Pinterest */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="text-xl text-red-600"><FaPinterest /></div>
                          <h4 className="text-md font-medium text-primary-800">Pinterest</h4>
                        </div>
                        
                        <div className="space-y-6">
                          {Object.entries(baseValues.pinterest || {}).map(([postType, engagementTypes]) => (
                            <div key={`pinterest-${postType}`} className="space-y-2">
                              <h5 className="text-sm font-medium text-primary-700 capitalize border-b pb-1">
                                {postType.charAt(0).toUpperCase() + postType.slice(1)}
                              </h5>
                              
                              <div className="flex flex-wrap gap-3">
                                {Object.entries(engagementTypes).map(([engType, value]) => (
                                  <div key={`pinterest-${postType}-${engType}`} className="flex items-center space-x-1">
                                    <Label htmlFor={`base-pinterest-${postType}-${engType}`} className="capitalize text-xs min-w-24">
                                      {engType.charAt(0).toUpperCase() + engType.slice(1)}:
                                    </Label>
                                    <div className="flex items-center">
                                      <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm h-9">
                                        $
                                      </span>
                                      <Input
                                        id={`base-pinterest-${postType}-${engType}`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={value}
                                        onChange={(e) => handleBaseValueChange("pinterest", postType, engType, e.target.value)}
                                        className="rounded-l-none w-24 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
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