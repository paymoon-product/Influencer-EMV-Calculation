import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emvData } from "@/lib/emv-data";
import { MainLayout } from "@/components/MainLayout";

export default function EMVSettingsPage() {
  const [baseValues, setBaseValues] = useState(emvData.baseValues);
  const [customTopics, setCustomTopics] = useState<Array<{name: string, factor: number}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem('emv-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setBaseValues(settings.baseValues || emvData.baseValues);
      setCustomTopics(settings.customTopics || []);
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      baseValues,
      customTopics
    };
    localStorage.setItem('emv-settings', JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "Your EMV settings have been saved successfully.",
    });
  };

  const resetToDefaults = () => {
    setBaseValues(emvData.baseValues);
    setCustomTopics([]);
    localStorage.removeItem('emv-settings');
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };

  const addCustomTopic = () => {
    setCustomTopics([...customTopics, { name: "", factor: 1.0 }]);
  };

  const removeCustomTopic = (index: number) => {
    setCustomTopics(customTopics.filter((_, i) => i !== index));
  };

  const updateCustomTopic = (index: number, field: string, value: string | number) => {
    const updated = [...customTopics];
    updated[index] = { ...updated[index], [field]: value };
    setCustomTopics(updated);
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">EMV Settings</h1>
        <p className="mt-2 text-gray-600">
          Customize your EMV calculation parameters and factors
        </p>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="base-values" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="base-values">Base EMV Values</TabsTrigger>
            <TabsTrigger value="custom-topics">Custom Topics</TabsTrigger>
          </TabsList>

          <TabsContent value="base-values" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Engagement Base Values</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(baseValues).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={key} className="capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Input
                            id={key}
                            type="number"
                            step="0.01"
                            value={value}
                            onChange={(e) => setBaseValues({
                              ...baseValues,
                              [key]: parseFloat(e.target.value) || 0
                            })}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom-topics" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Custom Content Topics</h3>
                    <Button onClick={addCustomTopic} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Topic
                    </Button>
                  </div>

                  {customTopics.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No custom topics configured. Click "Add Topic" to create one.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customTopics.map((topic, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="flex-1">
                            <Label htmlFor={`topic-name-${index}`}>Topic Name</Label>
                            <Input
                              id={`topic-name-${index}`}
                              value={topic.name}
                              onChange={(e) => updateCustomTopic(index, 'name', e.target.value)}
                              placeholder="e.g., Sports, Lifestyle"
                            />
                          </div>
                          <div className="w-32">
                            <Label htmlFor={`topic-factor-${index}`}>Factor</Label>
                            <Input
                              id={`topic-factor-${index}`}
                              type="number"
                              step="0.1"
                              value={topic.factor}
                              onChange={(e) => updateCustomTopic(index, 'factor', parseFloat(e.target.value) || 1.0)}
                            />
                          </div>
                          <Button
                            onClick={() => removeCustomTopic(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button onClick={resetToDefaults} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}