import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { emvData, FormValues } from "@/lib/emv-data";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Dynamically build the form schema based on selected platform and post type
const createFormSchema = (platform: string, postType: string) => {
  const baseSchema = z.object({
    platform: z.string().min(1, "Platform is required"),
    postType: z.string().min(1, "Post type is required"),
    creatorSize: z.string().min(1, "Creator size is required"),
    contentTopic: z.string().min(1, "Content topic is required"),
  });

  if (!platform || !postType) {
    return baseSchema;
  }

  const fields = emvData.engagementFields[platform]?.[postType] || [];
  const engagementSchema: Record<string, z.ZodType<any>> = {};

  fields.forEach((field) => {
    engagementSchema[field] = z.number().min(0).optional();
  });

  return baseSchema.extend(engagementSchema);
};

type EMVFormProps = {
  onSubmit: (values: FormValues) => void;
};

export function EMVForm({ onSubmit }: EMVFormProps) {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedPostType, setSelectedPostType] = useState("");
  const [formSchema, setFormSchema] = useState(createFormSchema("", ""));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: "",
      postType: "",
      creatorSize: "",
      contentTopic: "",
    },
  });

  // Update the form schema when platform or post type changes
  useEffect(() => {
    setFormSchema(createFormSchema(selectedPlatform, selectedPostType));
  }, [selectedPlatform, selectedPostType]);

  // Handle platform change
  const handlePlatformChange = (value: string) => {
    setSelectedPlatform(value);
    setSelectedPostType("");
    form.setValue("platform", value);
    form.setValue("postType", "");
  };

  // Handle post type change
  const handlePostTypeChange = (value: string) => {
    setSelectedPostType(value);
    form.setValue("postType", value);
  };

  // Handle form submission
  const handleFormSubmit = (values: FormValues) => {
    const hasEngagement = Object.keys(values).some((key) => {
      const field = key as keyof FormValues;
      return emvData.engagementFields[values.platform]?.[values.postType]?.includes(field as string) && values[field] && Number(values[field]) > 0;
    });

    if (!hasEngagement) {
      form.setError("platform", {
        type: "manual",
        message: "Please enter at least one engagement metric",
      });
      return;
    }

    onSubmit(values);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-6">Input Parameters</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Platform Selection */}
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select
                      onValueChange={(value) => handlePlatformChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="pinterest">Pinterest</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Post Type Selection */}
              <FormField
                control={form.control}
                name="postType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Type</FormLabel>
                    <Select
                      onValueChange={(value) => handlePostTypeChange(value)}
                      value={field.value}
                      disabled={!selectedPlatform}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Post Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedPlatform &&
                          emvData.postTypes[selectedPlatform]?.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Creator Size */}
            <FormField
              control={form.control}
              name="creatorSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creator Size</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Creator Size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="brand_fan">Brand Fan (up to 2.5K followers)</SelectItem>
                      <SelectItem value="nano">Nano Creator (2.5K-25K followers)</SelectItem>
                      <SelectItem value="micro">Micro Creator (25K-60K followers)</SelectItem>
                      <SelectItem value="mid_tier">Mid-Tier Creator (60K-100K followers)</SelectItem>
                      <SelectItem value="macro">Macro Creator (100K-1M followers)</SelectItem>
                      <SelectItem value="celebrity">Celebrity Creator (1M+ followers)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Content Topic */}
            <FormField
              control={form.control}
              name="contentTopic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Topic</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Content Topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectItem value="beauty">Beauty</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Engagement Metrics */}
            {selectedPlatform && selectedPostType && (
              <div>
                <h4 className="text-sm font-medium text-primary-700 mb-3">Engagement Metrics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {emvData.engagementFields[selectedPlatform][selectedPostType].map((field) => (
                    <FormField
                      key={field}
                      control={form.control}
                      name={field as any}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder={`Enter ${field}`}
                              {...formField}
                              onChange={(e) => formField.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={!selectedPlatform || !selectedPostType}
              >
                Calculate EMV
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
