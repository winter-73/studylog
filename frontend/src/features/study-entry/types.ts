export type GrowthTag = "Understanding" | "Building" | "Output";

export type StudyEntryInput = {
  date: string;
  durationMinutes: number;
  category: string;
  growthTags: GrowthTag[];
  note: string;
};

export type StudyEntry = StudyEntryInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type WeeklySummary = {
  weekStart: string;
  totalMinutes: number;
  entriesCount: number;
  topGrowthTags: Array<{ tag: GrowthTag; minutes: number }>;
};
