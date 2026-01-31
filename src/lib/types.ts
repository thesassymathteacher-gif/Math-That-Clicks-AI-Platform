export type Interest = "sports" | "music" | "gaming" | "food" | "money" | "";

export type Difficulty = "basics" | "challenge";

export type ScenarioId = "sneakers" | "gaming" | "sports";

export type CraStage = "concrete" | "representational" | "abstract";

export type EquationType = "add" | "subtract" | "multiply" | "divide";

export interface Scenario {
  id: ScenarioId;
  title: string;
  description: string;
  highlight: string;
  interestMatch?: Interest;
  contexts: {
    add: string;
    subtract: string;
    multiply: string;
    divide: string;
  };
}

export interface Equation {
  type: EquationType;
  equation: string;
  solution: number;
  a: number;
  b: number;
}

export interface PracticeQuestion {
  id: string;
  stage: CraStage;
  prompt: string;
  equation: Equation;
}
