"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildPrompt,
  generateEquation,
  generateExitTicket,
  generatePractice
} from "@/lib/generator";
import { scenarios, standard } from "@/lib/scenarios";
import {
  CraStage,
  Difficulty,
  Interest,
  PracticeQuestion,
  ScenarioId
} from "@/lib/types";

const steps = [
  "Welcome",
  "Standard",
  "Choose a Scenario",
  "CRA Lesson",
  "Practice",
  "Exit Ticket"
];

const interestOptions: { value: Interest; label: string }[] = [
  { value: "", label: "Pick one (optional)" },
  { value: "sports", label: "Sports" },
  { value: "music", label: "Music" },
  { value: "gaming", label: "Gaming" },
  { value: "food", label: "Food" },
  { value: "money", label: "Money" }
];

const stageLabels: Record<CraStage, string> = {
  concrete: "Concrete",
  representational: "Representational",
  abstract: "Abstract"
};

const localStorageKey = "mtc-progress";

const getScenario = (scenarioId: ScenarioId | "") =>
  scenarios.find((scenario) => scenario.id === scenarioId) ?? scenarios[0];

export default function Home() {
  const [stepIndex, setStepIndex] = useState(0);
  const [lessonStage, setLessonStage] = useState<CraStage>("concrete");
  const [studentName, setStudentName] = useState("");
  const [interest, setInterest] = useState<Interest>("");
  const [scenarioId, setScenarioId] = useState<ScenarioId | "">("");
  const [difficulty, setDifficulty] = useState<Difficulty>("basics");
  const [teacherMode, setTeacherMode] = useState(false);
  const [lessonEquation, setLessonEquation] = useState(() =>
    generateEquation("basics")
  );
  const [practice, setPractice] = useState<PracticeQuestion[]>([]);
  const [exitTicket, setExitTicket] = useState<PracticeQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});
  const [nameError, setNameError] = useState("");

  const scenario = useMemo(() => getScenario(scenarioId), [scenarioId]);

  useEffect(() => {
    const stored = localStorage.getItem(localStorageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      setStudentName(parsed.studentName ?? "");
      setInterest(parsed.interest ?? "");
      setScenarioId(parsed.scenarioId ?? "");
      setDifficulty(parsed.difficulty ?? "basics");
      setTeacherMode(parsed.teacherMode ?? false);
      setStepIndex(parsed.stepIndex ?? 0);
    } catch (error) {
      console.warn("Unable to load progress", error);
    }
  }, []);

  useEffect(() => {
    const payload = {
      studentName,
      interest,
      scenarioId,
      difficulty,
      teacherMode,
      stepIndex
    };
    localStorage.setItem(localStorageKey, JSON.stringify(payload));
  }, [studentName, interest, scenarioId, difficulty, teacherMode, stepIndex]);

  useEffect(() => {
    setLessonEquation(generateEquation(difficulty));
  }, [difficulty, scenarioId]);

  useEffect(() => {
    if (stepIndex === 4) {
      const fresh = generatePractice(scenario, studentName || "Student", difficulty);
      setPractice(fresh);
      setResponses({});
      setFeedback({});
    }

    if (stepIndex === 5) {
      const fresh = generateExitTicket(
        scenario,
        studentName || "Student",
        difficulty
      );
      setExitTicket(fresh);
      setResponses({});
      setFeedback({});
    }
  }, [stepIndex, scenario, studentName, difficulty]);

  const progress = `${stepIndex + 1}/${steps.length}`;

  const handleContinue = () => {
    if (stepIndex === 0 && studentName.trim() === "") {
      setNameError("Please enter your name so we can personalize the story.");
      return;
    }
    setNameError("");
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleScenarioSelect = (id: ScenarioId) => {
    setScenarioId(id);
    setStepIndex(3);
  };

  const handleAnswer = (id: string, value: string) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const checkAnswer = (id: string, solution: number) => {
    const submitted = Number(responses[id]);
    if (Number.isNaN(submitted)) return;
    setFeedback((prev) => ({ ...prev, [id]: submitted === solution }));
  };

  const mastery = useMemo(() => {
    const total = Object.keys(feedback).length;
    const correct = Object.values(feedback).filter(Boolean).length;
    if (total === 0) return "Answer a few questions to see your progress.";
    const percentage = Math.round((correct / total) * 100);
    return `You have ${correct} correct out of ${total} checked (${percentage}%).`;
  }, [feedback]);

  const lessonPrompt = buildPrompt(
    scenario,
    lessonEquation,
    studentName || "Student"
  );

  const interestHint = interest
    ? `We can lean into ${interest} language when possible.`
    : "Choose any world you like!";

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Math That Clicks
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              One-Step Equations Studio
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            Step {progress}: {steps[stepIndex]}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <p>Progress indicator: {steps[stepIndex]}</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={teacherMode}
              onChange={(event) => setTeacherMode(event.target.checked)}
            />
            Teacher Mode
          </label>
        </div>
        {teacherMode && (
          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-semibold">Learning Objective</p>
            <p>{standard.description}</p>
          </div>
        )}
      </header>

      {stepIndex === 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Welcome!</h2>
          <p className="mt-2 text-slate-600">
            Tell us your name and pick an interest so we can personalize the
            story.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Student name
              </span>
              <input
                className="rounded-xl border border-slate-200 px-4 py-3 text-base"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Your name"
                required
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Interest (optional)
              </span>
              <select
                className="rounded-xl border border-slate-200 px-4 py-3 text-base"
                value={interest}
                onChange={(event) =>
                  setInterest(event.target.value as Interest)
                }
              >
                {interestOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {nameError && (
            <p className="mt-3 text-sm font-semibold text-rose-600">
              {nameError}
            </p>
          )}
          <button
            className="mt-6 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white"
            onClick={handleContinue}
          >
            Continue
          </button>
        </section>
      )}

      {stepIndex === 1 && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Today&apos;s Standard</h2>
          <p className="mt-2 text-slate-700">{standard.title}</p>
          <p className="mt-2 text-slate-600">{standard.description}</p>
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">
              What you&apos;ll be able to do
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
              <li>Solve equations using inverse operations.</li>
              <li>Explain your steps with models and words.</li>
              <li>Check your answer by substitution.</li>
            </ul>
          </div>
          <button
            className="mt-6 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white"
            onClick={handleContinue}
          >
            Choose a scenario
          </button>
        </section>
      )}

      {stepIndex === 2 && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Pick your world</h2>
          <p className="mt-2 text-slate-600">{interestHint}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {scenarios.map((option) => (
              <button
                key={option.id}
                className={`flex h-full flex-col gap-3 rounded-2xl border px-4 py-5 text-left transition hover:border-primary-500 hover:shadow-sm ${
                  scenarioId === option.id
                    ? "border-primary-600 bg-blue-50"
                    : "border-slate-200"
                }`}
                onClick={() => handleScenarioSelect(option.id)}
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {option.title}
                </h3>
                <p className="text-sm text-slate-600">{option.description}</p>
                <span className="mt-auto text-xs font-semibold uppercase text-primary-600">
                  {option.highlight}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {stepIndex === 3 && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">CRA Lesson</h2>
              <p className="mt-2 text-slate-600">Scenario: {scenario.title}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">
              Lesson {lessonStage === "concrete" ? 1 : lessonStage === "representational" ? 2 : 3}/3
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {(["concrete", "representational", "abstract"] as CraStage[]).map(
              (stage) => (
                <button
                  key={stage}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    lessonStage === stage
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                  onClick={() => setLessonStage(stage)}
                >
                  {stageLabels[stage]}
                </button>
              )
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-700">Story</p>
            <p className="mt-2 text-base text-slate-800">{lessonPrompt}</p>
            {teacherMode && (
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Equation: {lessonEquation.equation}
              </p>
            )}

            {lessonStage === "concrete" && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Model</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Left side</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                          x bag
                        </span>
                        {Array.from({ length: Math.abs(lessonEquation.a) }).map(
                          (_, index) => (
                            <span
                              key={`left-${index}`}
                              className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              tile
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Right side</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.from({ length: Math.abs(lessonEquation.b) }).map(
                          (_, index) => (
                            <span
                              key={`right-${index}`}
                              className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              tile
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Moves on both sides
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    <li>Add or remove the same tiles on both sides.</li>
                    <li>Keep the x bag by itself.</li>
                    <li>Explain your move in a short sentence.</li>
                  </ul>
                </div>
              </div>
            )}

            {lessonStage === "representational" && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Bar model
                  </p>
                  <div className="mt-3 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg bg-blue-200 p-3 text-center text-sm font-semibold">
                        x
                      </div>
                      <div className="rounded-lg bg-slate-200 px-4 py-3 text-sm font-semibold">
                        {lessonEquation.a}
                      </div>
                      <span className="text-sm font-semibold">=</span>
                      <div className="rounded-lg bg-emerald-200 px-4 py-3 text-sm font-semibold">
                        {lessonEquation.b}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">
                      Circle the x bar and show how you undo the extra tiles.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Guided prompt
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    What do you need to remove or split so the x bar stands
                    alone?
                  </p>
                </div>
              </div>
            )}

            {lessonStage === "abstract" && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Equation
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {lessonEquation.equation}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Use an inverse operation to isolate x.
                  </p>
                </div>
                <div className="rounded-xl border border-dashed border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Coach
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    <li>Identify the operation next to x.</li>
                    <li>Use the inverse to undo it on both sides.</li>
                    <li>Check by substituting your answer.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold"
              onClick={() => setLessonEquation(generateEquation(difficulty))}
            >
              New example
            </button>
            <button
              className="rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white"
              onClick={handleContinue}
            >
              Go to practice
            </button>
          </div>
        </section>
      )}

      {stepIndex === 4 && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Practice set</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="radio"
                  checked={difficulty === "basics"}
                  onChange={() => setDifficulty("basics")}
                />
                Basics
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="radio"
                  checked={difficulty === "challenge"}
                  onChange={() => setDifficulty("challenge")}
                />
                Challenge
              </label>
            </div>
          </div>
          <p className="mt-2 text-slate-600">
            Solve the questions below. You&apos;ll get instant feedback.
          </p>

          <div className="mt-4 grid gap-4">
            {practice.map((question) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {stageLabels[question.stage]}
                  </p>
                  {teacherMode && (
                    <span className="text-xs font-semibold text-slate-400">
                      {question.equation.equation}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-700">{question.prompt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={responses[question.id] ?? ""}
                    onChange={(event) => handleAnswer(question.id, event.target.value)}
                    placeholder="x ="
                  />
                  <button
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => checkAnswer(question.id, question.equation.solution)}
                  >
                    Check
                  </button>
                  {feedback[question.id] !== undefined && (
                    <span
                      className={`text-sm font-semibold ${
                        feedback[question.id]
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {feedback[question.id] ? "Correct!" : "Try again"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold"
              onClick={() =>
                setPractice(generatePractice(scenario, studentName || "Student", difficulty))
              }
            >
              Regenerate practice
            </button>
            <button
              className="rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white"
              onClick={handleContinue}
            >
              Exit ticket
            </button>
          </div>
        </section>
      )}

      {stepIndex === 5 && (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Exit ticket</h2>
          <p className="mt-2 text-slate-600">
            Two mixed questions to show what you know.
          </p>
          <div className="mt-4 grid gap-4">
            {exitTicket.map((question) => (
              <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    {stageLabels[question.stage]}
                  </p>
                  {teacherMode && (
                    <span className="text-xs font-semibold text-slate-400">
                      {question.equation.equation}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-700">{question.prompt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    value={responses[question.id] ?? ""}
                    onChange={(event) => handleAnswer(question.id, event.target.value)}
                    placeholder="x ="
                  />
                  <button
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => checkAnswer(question.id, question.equation.solution)}
                  >
                    Check
                  </button>
                  {feedback[question.id] !== undefined && (
                    <span
                      className={`text-sm font-semibold ${
                        feedback[question.id]
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {feedback[question.id] ? "Correct!" : "Try again"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-semibold">Mastery summary</p>
            <p className="mt-1">{mastery}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold"
              onClick={() => setStepIndex(0)}
            >
              Start over
            </button>
            <button
              className="rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white"
              onClick={() => setStepIndex(4)}
            >
              More practice
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
