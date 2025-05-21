import { emvData, FormValues, EMVResult, EMVBreakdownItem } from "./emv-data";

// Get user-customized factors or use defaults from emvData
function getCustomizedFactors() {
  // Try to get customized factors from localStorage
  const savedCreatorFactors = localStorage.getItem("emv-creator-factors");
  const savedPostTypeFactors = localStorage.getItem("emv-post-type-factors");
  const savedTopicFactors = localStorage.getItem("emv-topic-factors");
  const savedBaseValues = localStorage.getItem("emv-base-values");
  const savedCustomTopics = localStorage.getItem("emv-custom-topics");
  
  // Parse custom topics if they exist
  const customTopics = savedCustomTopics ? JSON.parse(savedCustomTopics) : {};
  
  // Combine default topic factors with custom topics
  const topicFactorsCombined = {
    ...emvData.topicFactors,
    ...(savedTopicFactors ? JSON.parse(savedTopicFactors) : {}),
    ...customTopics
  };
  
  // Return an object with either customized factors or defaults
  return {
    creatorFactors: savedCreatorFactors ? JSON.parse(savedCreatorFactors) : emvData.creatorFactors,
    postTypeFactors: savedPostTypeFactors ? JSON.parse(savedPostTypeFactors) : emvData.postTypeFactors,
    topicFactors: topicFactorsCombined,
    baseValues: savedBaseValues ? JSON.parse(savedBaseValues) : emvData.baseValues
  };
}

export function calculateEMV(values: FormValues): EMVResult {
  const { platform, postType, creatorSize, contentTopic } = values;
  
  // Get customized factors or defaults
  const customFactors = getCustomizedFactors();

  // Get adjustment factors
  const creatorFactor = customFactors.creatorFactors[creatorSize as keyof typeof customFactors.creatorFactors];
  const postTypeFactor = customFactors.postTypeFactors[`${platform}_${postType}` as keyof typeof customFactors.postTypeFactors];
  const topicFactor = customFactors.topicFactors[contentTopic as keyof typeof customFactors.topicFactors];

  let totalEMV = 0;
  const breakdown: EMVBreakdownItem[] = [];

  // Get engagement fields for selected platform and post type
  const fields = emvData.engagementFields[platform as keyof typeof emvData.engagementFields][
    postType as keyof (typeof emvData.engagementFields)[keyof typeof emvData.engagementFields]
  ];

  // Calculate EMV for each engagement type
  fields.forEach((field) => {
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
