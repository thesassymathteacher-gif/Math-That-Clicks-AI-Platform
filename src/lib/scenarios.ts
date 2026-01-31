import { Scenario } from "./types";

export const scenarios: Scenario[] = [
  {
    id: "sneakers",
    title: "Sneakers & Money",
    description: "Shop for limited sneakers and keep track of your budget.",
    highlight: "shopping",
    interestMatch: "money",
    contexts: {
      add: "{name} has x dollars and adds {a} more from a gift card to buy sneakers for {b} dollars.",
      subtract: "{name} spends {a} dollars on laces and has x dollars left to reach {b} dollars total.",
      multiply: "{name} buys {a} pairs of socks that each cost x dollars for a total of {b} dollars.",
      divide: "{name} splits x dollars evenly into {a} sneaker savings jars and each has {b} dollars."
    }
  },
  {
    id: "gaming",
    title: "Video Game Points",
    description: "Level up by tracking points earned in missions.",
    highlight: "gaming",
    interestMatch: "gaming",
    contexts: {
      add: "{name} has x points and earns {a} more in a quest for {b} points total.",
      subtract: "{name} loses {a} points but ends with {b} points total, so they started with x points.",
      multiply: "{name} completes {a} missions worth x points each for {b} points total.",
      divide: "{name} shares x points across {a} levels and each level gets {b} points."
    }
  },
  {
    id: "sports",
    title: "Sports Training Reps",
    description: "Track practice reps during training sessions.",
    highlight: "sports",
    interestMatch: "sports",
    contexts: {
      add: "{name} finishes x reps and then does {a} more for {b} reps total.",
      subtract: "{name} skips {a} reps and ends with {b} reps, so they planned x reps.",
      multiply: "{name} runs {a} drills with x reps each for {b} reps total.",
      divide: "{name} splits x reps into {a} sets and each set has {b} reps."
    }
  }
];

export const standard = {
  title: "I can solve one-step linear equations.",
  description: "Solve x + a = b, x - a = b, a·x = b, and x ÷ a = b using inverse operations."
};
