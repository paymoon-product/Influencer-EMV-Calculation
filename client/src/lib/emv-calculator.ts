import { emvData, FormValues, EMVResult, EMVBreakdownItem } from "./emv-data";

// Get user-customized factors or use defaults from emvData
function getCustomizedFactors() {
  // Try to get settings from localStorage
  const savedSettings = localStorage.getItem('emv-settings');
  
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    
    // Combine default topic factors with custom topics if available
    const customTopicsFactors: {[key: string]: number} = {};
    if (settings.customTopics) {
      settings.customTopics.forEach((topic: {name: string, factor: number}) => {
        customTopicsFactors[topic.name.toLowerCase()] = topic.factor;
      });
    }
    
    const topicFactorsCombined = {
      ...emvData.topicFactors,
      ...(settings.contentTopicFactors || {}),
      ...customTopicsFactors
    };
    
    return {
      creatorFactors: settings.creatorSizeFactors || emvData.creatorFactors,
      postTypeFactors: settings.postTypeFactors || emvData.postTypeFactors,
      topicFactors: topicFactorsCombined,
      baseValues: settings.baseValues || emvData.baseValues
    };
  }
  
  // Return defaults if no settings found
  return {
    creatorFactors: emvData.creatorFactors,
    postTypeFactors: emvData.postTypeFactors,
    topicFactors: emvData.topicFactors,
    baseValues: emvData.baseValues
  };
}

export function calculateEMV(values: FormValues): EMVResult {
  const { platform, postType, creatorSize, contentTopic } = values;
  
  // Get customized factors or defaults
  const customFactors = getCustomizedFactors();

  // Get adjustment factors (default to 1.0 if not provided or empty)
  const creatorFactor = (creatorSize && creatorSize.trim() !== '') 
    ? customFactors.creatorFactors[creatorSize as keyof typeof customFactors.creatorFactors] || 1.0
    : 1.0;
  const postTypeFactor = customFactors.postTypeFactors[`${platform}_${postType}` as keyof typeof customFactors.postTypeFactors];
  const topicFactor = (contentTopic && contentTopic.trim() !== '') 
    ? customFactors.topicFactors[contentTopic as keyof typeof customFactors.topicFactors] || 1.0
    : 1.0;

  let totalEMV = 0;
  const breakdown: EMVBreakdownItem[] = [];

  // Get engagement fields for selected platform and post type
  const platformFields = emvData.engagementFields[platform as keyof typeof emvData.engagementFields];
  const fields = platformFields ? platformFields[postType as keyof typeof platformFields] : [];

  // Calculate EMV for each engagement type
  if (fields && Array.isArray(fields)) {
    fields.forEach((field: string) => {
      const count = Number(values[field]) || 0;
      if (count > 0) {
        // Use customized base values if available, otherwise use default ones
        const baseValue = customFactors.baseValues[platform as keyof typeof emvData.baseValues]?.[
          postType as keyof (typeof emvData.baseValues)[keyof typeof emvData.baseValues]
        ]?.[field as keyof any] || emvData.baseValues[platform as keyof typeof emvData.baseValues][
          postType as keyof (typeof emvData.baseValues)[keyof typeof emvData.baseValues]
        ][field as keyof any];

        const engagementEMV = count * baseValue * creatorFactor * postTypeFactor * topicFactor;
        totalEMV += engagementEMV;

        breakdown.push({
          type: field,
          count,
          baseValue,
          emv: engagementEMV
        });
      }
    });
  }

  return {
    platform,
    postType,
    creatorFactor,
    postTypeFactor,
    topicFactor,
    totalEMV,
    breakdown
  };
}
