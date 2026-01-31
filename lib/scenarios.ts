export type ScenarioId = "sneakers" | "gaming" | "sports";

export type Scenario = {
  id: ScenarioId;
  title: string;
  description: string;
  tags: string[];
  items: {
    unit: string;
    pluralUnit: string;
    container: string;
  };
};

export const scenarios: Scenario[] = [
  {
    id: "sneakers",
    title: "Sneakers & Money",
    description: "Shopping for sneakers with a budget and discounts.",
    tags: ["money", "shopping"],
    items: {
      unit: "dollar",
      pluralUnit: "dollars",
      container: "sneaker box"
    }
  },
  {
    id: "gaming",
    title: "Video Game Points",
    description: "Leveling up with points and bonus packs.",
    tags: ["gaming"],
    items: {
      unit: "point",
      pluralUnit: "points",
      container: "bonus pack"
    }
  },
  {
    id: "sports",
    title: "Sports Training Reps",
    description: "Training sessions with reps and sets.",
    tags: ["sports"],
    items: {
      unit: "rep",
      pluralUnit: "reps",
      container: "training set"
    }
  }
];

export const interestOptions = [
  { label: "Sports", value: "sports" },
  { label: "Music", value: "music" },
  { label: "Gaming", value: "gaming" },
  { label: "Food", value: "food" },
  { label: "Money", value: "money" }
];
