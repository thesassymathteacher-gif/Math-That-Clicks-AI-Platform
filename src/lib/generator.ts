import { Difficulty, Equation, EquationType, PracticeQuestion, Scenario } from "./types";

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const choose = <T,>(items: T[]): T => items[randInt(0, items.length - 1)];

const maybeNeg = (value: number, difficulty: Difficulty) =>
  difficulty === "challenge" && Math.random() < 0.35 ? -value : value;

export const generateEquation = (difficulty: Difficulty): Equation => {
  const type = choose<EquationType>(["add", "subtract", "multiply", "divide"]);

  if (type === "add") {
    const a = maybeNeg(randInt(2, 12), difficulty);
    const x = randInt(2, 15);
    const b = x + a;
    return { type, equation: `x + ${a} = ${b}`, solution: x, a, b };
  }

  if (type === "subtract") {
    const a = maybeNeg(randInt(2, 12), difficulty);
    const x = randInt(2, 15);
    const b = x - a;
    return { type, equation: `x - ${a} = ${b}`, solution: x, a, b };
  }

  if (type === "multiply") {
    const a = maybeNeg(randInt(2, 9), difficulty);
    const x = randInt(2, 12);
    const b = a * x;
    return { type, equation: `${a}x = ${b}`, solution: x, a, b };
  }

  const a = maybeNeg(randInt(2, 9), difficulty);
  const b = randInt(2, 12);
  const x = a * b;
  return { type, equation: `x / ${a} = ${b}`, solution: x, a, b };
};

export const buildPrompt = (scenario: Scenario, equation: Equation, name: string) => {
  const template = scenario.contexts[equation.type];
  return template
    .replace("{name}", name)
    .replace("{a}", `${equation.a}`)
    .replace("{b}", `${equation.b}`)
    .replace("{x}", "x");
};

export const generatePractice = (
  scenario: Scenario,
  name: string,
  difficulty: Difficulty
): PracticeQuestion[] => {
  const stages: PracticeQuestion[] = [];
  const stageMap: PracticeQuestion["stage"][] = [
    "concrete",
    "concrete",
    "representational",
    "representational",
    "abstract",
    "abstract",
    "abstract",
    "abstract"
  ];

  stageMap.forEach((stage, index) => {
    const equation = generateEquation(difficulty);
    stages.push({
      id: `${stage}-${index}-${Date.now()}`,
      stage,
      equation,
      prompt: buildPrompt(scenario, equation, name)
    });
  });

  return stages;
};

export const generateExitTicket = (
  scenario: Scenario,
  name: string,
  difficulty: Difficulty
): PracticeQuestion[] => {
  return [0, 1].map((index) => {
    const equation = generateEquation(difficulty);
    return {
      id: `exit-${index}-${Date.now()}`,
      stage: choose(["concrete", "representational", "abstract"]),
      equation,
      prompt: buildPrompt(scenario, equation, name)
    };
  });
};
