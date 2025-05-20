import { emvData, FormValues, EMVResult, EMVBreakdownItem } from "./emv-data";

export function calculateEMV(values: FormValues): EMVResult {
  const { platform, postType, creatorSize, contentTopic } = values;

  // Get adjustment factors
  const creatorFactor = emvData.creatorFactors[creatorSize as keyof typeof emvData.creatorFactors];
  const postTypeFactor = emvData.postTypeFactors[`${platform}_${postType}` as keyof typeof emvData.postTypeFactors];
  const topicFactor = emvData.topicFactors[contentTopic as keyof typeof emvData.topicFactors];

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
      const baseValue = emvData.baseValues[platform as keyof typeof emvData.baseValues][
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
