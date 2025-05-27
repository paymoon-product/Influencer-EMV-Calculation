// EMV data structure based on the provided PDF
export const emvData = {
  baseValues: {
    instagram: {
      post: {
        impressions: 0.08,
        likes: 0.20,
        comments: 4.50,
        shares: 3.00,
        saves: 3.50
      },
      story: {
        impressions: 0.07,
        likes: 0.20,
        shares: 3.00
      },
      reel: {
        views: 0.12,
        likes: 0.25,
        comments: 5.00,
        shares: 3.00,
        saves: 3.50
      }
    },
    tiktok: {
      video: {
        views: 0.08,
        likes: 0.15,
        comments: 2.50,
        shares: 1.00,
        saves: 1.00
      }
    },
    youtube: {
      video: {
        views: 0.12,
        likes: 0.90,
        comments: 8.50,
        shares: 3.00,
        saves: 3.00
      },
      shorts: {
        views: 0.08,
        likes: 0.15,
        comments: 2.50,
        shares: 1.00,
        saves: 1.00
      }
    },
    pinterest: {
      pin: {
        impressions: 0.07,
        clicks: 3.50,
        saves: 3.50,
        closeups: 0.10
      }
    }
  },
  platformFactors: {
    instagram: 1.0,
    tiktok: 1.4,
    youtube: 1.1,
    pinterest: 0.7
  },
  creatorFactors: {
    brand_fan: 0.8,
    nano: 0.9,
    micro: 1.2,
    mid_tier: 1.0,
    macro: 0.95,
    celebrity: 0.9
  },
  postTypeFactors: {
    instagram_post: 1.0,
    instagram_reel: 1.3,
    instagram_story: 0.8,
    tiktok_video: 1.4,
    youtube_video: 1.1,
    youtube_shorts: 0.9,
    pinterest_pin: 0.7
  },
  topicFactors: {
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
  },
  postTypes: {
    instagram: ["post", "reel", "story"],
    tiktok: ["video"],
    youtube: ["video", "shorts"],
    pinterest: ["pin"]
  },
  engagementFields: {
    instagram: {
      post: ["impressions", "likes", "comments", "shares", "saves"],
      story: ["impressions", "likes", "shares"],
      reel: ["views", "likes", "comments", "shares", "saves"]
    },
    tiktok: {
      video: ["views", "likes", "comments", "shares", "saves"]
    },
    youtube: {
      video: ["views", "likes", "comments", "shares", "saves"],
      shorts: ["views", "likes", "comments", "shares", "saves"]
    },
    pinterest: {
      pin: ["impressions", "clicks", "saves", "closeups"]
    }
  }
};

// Type definitions
export interface FormValues {
  platform: string;
  postType: string;
  creatorSize: string;
  contentTopic: string;
  [key: string]: string | number | undefined;
}

export interface EMVBreakdownItem {
  type: string;
  count: number;
  baseValue: number;
  emv: number;
}

export interface EMVResult {
  platform: string;
  postType: string;
  creatorFactor: number;
  postTypeFactor: number;
  topicFactor: number;
  totalEMV: number;
  breakdown: EMVBreakdownItem[];
}

export interface EMVCalculation {
  id: string;
  date: string;
  parameters: FormValues;
  result: EMVResult;
}
