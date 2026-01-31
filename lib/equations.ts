export type EquationType = "add" | "subtract" | "multiply" | "divide";

export type Equation = {
  type: EquationType;
  a: number;
  b: number;
  solution: number;
  text: string;
};

const range = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const nonZero = (min: number, max: number) => {
  let value = 0;
  while (value === 0) {
    value = range(min, max);
  }
  return value;
};

const signedRange = (min: number, max: number) => {
  const value = range(min, max);
  return Math.random() < 0.5 ? -value : value;
};

const formatSigned = (value: number) => (value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`);

export const buildEquation = (type: EquationType, allowNegatives: boolean): Equation => {
  switch (type) {
    case "add": {
      const a = allowNegatives ? signedRange(1, 12) : range(1, 12);
      const solution = allowNegatives ? signedRange(1, 12) : range(1, 12);
      const b = solution + a;
      return {
        type,
        a,
        b,
        solution,
        text: `x ${formatSigned(a)} = ${b}`
      };
    }
    case "subtract": {
      const a = allowNegatives ? signedRange(1, 12) : range(1, 12);
      const solution = allowNegatives ? signedRange(1, 12) : range(1, 12);
      const b = solution - a;
      return {
        type,
        a,
        b,
        solution,
        text: `x ${formatSigned(-a)} = ${b}`
      };
    }
    case "multiply": {
      const a = allowNegatives ? signedRange(2, 10) : range(2, 10);
      const solution = allowNegatives ? signedRange(1, 10) : range(1, 10);
      const b = a * solution;
      return {
        type,
        a,
        b,
        solution,
        text: `${a}x = ${b}`
      };
    }
    case "divide": {
      const a = allowNegatives ? signedRange(2, 10) : range(2, 10);
      const solution = allowNegatives ? signedRange(1, 10) : range(1, 10);
      const b = solution;
      const numerator = a * b;
      return {
        type,
        a,
        b: numerator,
        solution,
        text: `x / ${a} = ${b}`
      };
    }
    default: {
      const a = nonZero(1, 10);
      return { type: "add", a, b: a, solution: 0, text: "x + 0 = 0" };
    }
  }
};

export const buildPracticeSet = (allowNegatives: boolean): Equation[] => {
  const types: EquationType[] = [
    "add",
    "subtract",
    "multiply",
    "divide",
    "add",
    "subtract",
    "multiply",
    "divide"
  ];
  return types.map((type) => buildEquation(type, allowNegatives));
};

export const buildExitTicket = (allowNegatives: boolean): Equation[] => {
  return [buildEquation("add", allowNegatives), buildEquation("multiply", allowNegatives)];
};
