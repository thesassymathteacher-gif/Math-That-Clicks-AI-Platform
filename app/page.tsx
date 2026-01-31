"use client";

import { useEffect, useMemo, useState } from "react";
import ProgressIndicator from "@/components/ProgressIndicator";
import ScenarioCard from "@/components/ScenarioCard";
import { buildExitTicket, buildPracticeSet, buildEquation, Equation } from "@/lib/equations";
import { interestOptions, scenarios, ScenarioId } from "@/lib/scenarios";

type Step = "welcome" | "standard" | "scenario" | "lesson" | "practice" | "exit";

type PracticeAnswer = {
  value: string;
  correct?: boolean;
};

type SavedState = {
  studentName: string;
  interest: string;
  scenarioId: ScenarioId | "";
  step: Step;
  difficulty: "basics" | "challenge";
  teacherMode: boolean;
  lessonIndex: number;
};

const STORAGE_KEY = "mtc-one-step-progress";

const standard = {
  title: "I can solve one-step linear equations.",
  description: "You will isolate x using inverse operations like add/subtract or multiply/divide."
};

const lessonObjective = "Solve one-step equations by doing the same operation on both sides.";

const buildScenarioPrompt = (equation: Equation, scenarioId: ScenarioId, name: string) => {
  const scenario = scenarios.find((item) => item.id === scenarioId);
  const student = name || "The student";
  if (!scenario) {
    return `Solve for x: ${equation.text}`;
  }
  const unit = equation.solution === 1 ? scenario.items.unit : scenario.items.pluralUnit;
  switch (equation.type) {
    case "add":
      return `${student} starts with x ${unit} and earns ${equation.a} more. Now they have ${equation.b} ${unit}.`;
    case "subtract":
      return `${student} has x ${unit} and uses ${Math.abs(equation.a)}. ${student} ends with ${equation.b} ${unit}.`;
    case "multiply":
      return `${student} has ${equation.b} ${unit} total in ${Math.abs(equation.a)} equal ${scenario.items.container}s.`;
    case "divide":
      return `${student} shares x ${unit} equally into ${Math.abs(equation.a)} ${scenario.items.container}s and each has ${equation.b}.`;
    default:
      return `Solve for x: ${equation.text}`;
  }
};

const buildLessonEquation = () => buildEquation("add", false);

export default function Home() {
  const [studentName, setStudentName] = useState("");
  const [interest, setInterest] = useState("");
  const [scenarioId, setScenarioId] = useState<ScenarioId | "">("");
  const [step, setStep] = useState<Step>("welcome");
  const [difficulty, setDifficulty] = useState<"basics" | "challenge">("basics");
  const [teacherMode, setTeacherMode] = useState(false);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [lessonEquation] = useState(buildLessonEquation);
  const [tileLeft, setTileLeft] = useState(lessonEquation.a);
  const [tileRight, setTileRight] = useState(lessonEquation.b);
  const [practiceSet, setPracticeSet] = useState<Equation[]>([]);
  const [practiceAnswers, setPracticeAnswers] = useState<PracticeAnswer[]>([]);
  const [exitSet, setExitSet] = useState<Equation[]>([]);
  const [exitAnswers, setExitAnswers] = useState<PracticeAnswer[]>([]);
  const [showNameError, setShowNameError] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    const saved = JSON.parse(raw) as SavedState;
    setStudentName(saved.studentName || "");
    setInterest(saved.interest || "");
    setScenarioId(saved.scenarioId || "");
    setStep(saved.step || "welcome");
    setDifficulty(saved.difficulty || "basics");
    setTeacherMode(Boolean(saved.teacherMode));
    setLessonIndex(saved.lessonIndex || 0);
  }, []);

  useEffect(() => {
    const payload: SavedState = {
      studentName,
      interest,
      scenarioId,
      step,
      difficulty,
      teacherMode,
      lessonIndex
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [studentName, interest, scenarioId, step, difficulty, teacherMode, lessonIndex]);

  useEffect(() => {
    setPracticeSet(buildPracticeSet(difficulty === "challenge"));
    setPracticeAnswers(Array.from({ length: 8 }, () => ({ value: "" })));
  }, [difficulty]);

  useEffect(() => {
    setExitSet(buildExitTicket(difficulty === "challenge"));
    setExitAnswers(Array.from({ length: 2 }, () => ({ value: "" })));
  }, [difficulty]);

  const selectedScenario = scenarios.find((item) => item.id === scenarioId);
  const recommendedScenario = useMemo(() => {
    if (!interest) return "";
    const match = scenarios.find((scenario) => scenario.tags.includes(interest));
    return match?.id ?? "";
  }, [interest]);

  const handleStart = () => {
    if (!studentName.trim()) {
      setShowNameError(true);
      return;
    }
    setShowNameError(false);
    setStep("standard");
  };

  const handleNextLesson = () => {
    if (lessonIndex < 2) {
      setLessonIndex((prev) => prev + 1);
    } else {
      setStep("practice");
    }
  };

  const handlePracticeAnswer = (index: number, value: string) => {
    setPracticeAnswers((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, value } : item))
    );
  };

  const gradePractice = (index: number) => {
    setPracticeAnswers((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const solution = practiceSet[idx]?.solution;
        const numeric = Number(item.value);
        const correct = Number.isFinite(numeric) && numeric === solution;
        return { ...item, correct };
      })
    );
  };

  const handleExitAnswer = (index: number, value: string) => {
    setExitAnswers((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, value } : item))
    );
  };

  const gradeExit = () => {
    setExitAnswers((prev) =>
      prev.map((item, idx) => {
        const solution = exitSet[idx]?.solution;
        const numeric = Number(item.value);
        const correct = Number.isFinite(numeric) && numeric === solution;
        return { ...item, correct };
      })
    );
  };

  const masteryCount = exitAnswers.filter((item) => item.correct).length;

  const regeneratePractice = () => {
    setPracticeSet(buildPracticeSet(difficulty === "challenge"));
    setPracticeAnswers(Array.from({ length: 8 }, () => ({ value: "" })));
  };

  const friendlyName = studentName.trim() || "Student";

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Math That Clicks</p>
            <h1 className="text-2xl font-bold text-slate-900">One-Step Equations Adventure</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={teacherMode}
                onChange={(event) => setTeacherMode(event.target.checked)}
              />
              Teacher Mode
            </label>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm">
              <button
                type="button"
                onClick={() => setDifficulty("basics")}
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  difficulty === "basics" ? "bg-brand-600 text-white" : "text-slate-600"
                }`}
              >
                Basics
              </button>
              <button
                type="button"
                onClick={() => setDifficulty("challenge")}
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  difficulty === "challenge" ? "bg-brand-600 text-white" : "text-slate-600"
                }`}
              >
                Challenge
              </button>
            </div>
          </div>
        </div>
        {teacherMode && (
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            <p className="font-semibold">Learning Objective</p>
            <p>{lessonObjective}</p>
          </div>
        )}
      </header>

      {step === "welcome" && (
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Welcome!</h2>
          <p className="mt-2 text-slate-600">Let&apos;s set up your learning path.</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Your name</label>
              <input
                type="text"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
                placeholder="Enter your name"
                required
              />
              {showNameError && (
                <p className="text-sm font-semibold text-rose-500">Please add your name to continue.</p>
              )}
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Pick an interest (optional)</label>
              <select
                value={interest}
                onChange={(event) => setInterest(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
              >
                <option value="">No preference</option>
                {interestOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="mt-8 rounded-full bg-brand-600 px-6 py-3 text-lg font-semibold text-white"
          >
            Start Learning
          </button>
        </section>
      )}

      {step === "standard" && (
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Today&apos;s Standard</h2>
          <p className="mt-4 text-2xl font-bold text-brand-700">{standard.title}</p>
          <p className="mt-3 text-slate-600">{standard.description}</p>
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => setStep("scenario")}
              className="rounded-full bg-brand-600 px-6 py-3 text-lg font-semibold text-white"
            >
              Choose a scenario
            </button>
            <button
              type="button"
              onClick={() => setStep("welcome")}
              className="rounded-full border border-slate-300 px-6 py-3 text-lg font-semibold text-slate-700"
            >
              Back
            </button>
          </div>
        </section>
      )}

      {step === "scenario" && (
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Pick your world</h2>
          <p className="mt-2 text-slate-600">Choose the story you want for your math practice.</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                selected={scenarioId === scenario.id}
                recommended={recommendedScenario === scenario.id}
                onSelect={(id) => setScenarioId(id)}
              />
            ))}
          </div>
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => scenarioId && setStep("lesson")}
              className="rounded-full bg-brand-600 px-6 py-3 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!scenarioId}
            >
              Start Lesson
            </button>
            <button
              type="button"
              onClick={() => setStep("standard")}
              className="rounded-full border border-slate-300 px-6 py-3 text-lg font-semibold text-slate-700"
            >
              Back
            </button>
          </div>
        </section>
      )}

      {step === "lesson" && (
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6">
            <ProgressIndicator label="Lesson" step={lessonIndex + 1} total={3} />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">
                {lessonIndex === 0 && "Concrete: Balance the tiles"}
                {lessonIndex === 1 && "Representational: Bar model"}
                {lessonIndex === 2 && "Abstract: Equation"}
              </h2>
              <span className="rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-600">
                Scenario: {selectedScenario?.title}
              </span>
            </div>
          </div>

          {lessonIndex === 0 && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm font-semibold text-slate-600">Goal: isolate the bag (x).</p>
                <div className="mt-6 flex items-center justify-between gap-6">
                  <div className="flex flex-1 flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-4">
                    <span className="rounded-xl bg-brand-100 px-3 py-2 text-lg font-semibold text-brand-700">
                      🎒 x
                    </span>
                    {Array.from({ length: tileLeft }).map((_, index) => (
                      <span
                        key={`left-${index}`}
                        className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700"
                      >
                        1
                      </span>
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-slate-500">=</span>
                  <div className="flex flex-1 flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-4">
                    {Array.from({ length: tileRight }).map((_, index) => (
                      <span
                        key={`right-${index}`}
                        className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700"
                      >
                        1
                      </span>
                    ))}
                  </div>
                </div>
                {teacherMode && (
                  <p className="mt-4 text-sm text-slate-500">Equation: {lessonEquation.text}</p>
                )}
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-6">
                <p className="text-slate-600">Try removing the same number of tiles from both sides.</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => {
                      if (tileLeft > 0 && tileRight > 0) {
                        setTileLeft((prev) => prev - 1);
                        setTileRight((prev) => prev - 1);
                      }
                    }}
                  >
                    Remove 1 from both sides
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                    onClick={() => {
                      setTileLeft(lessonEquation.a);
                      setTileRight(lessonEquation.b);
                    }}
                  >
                    Reset tiles
                  </button>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  {tileLeft === 0 ? (
                    <p>Nice! The bag is alone. That means x = {tileRight}.</p>
                  ) : (
                    <p>Keep removing tiles until only the bag is left.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {lessonIndex === 1 && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm font-semibold text-slate-600">Bar model</p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex flex-1">
                    <div className="flex w-full overflow-hidden rounded-xl border border-brand-200">
                      <div className="flex-1 bg-brand-100 p-4 text-center font-semibold text-brand-700">x</div>
                      <div className="w-24 bg-emerald-100 p-4 text-center font-semibold text-emerald-700">
                        {lessonEquation.a}
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-semibold text-slate-500">=</div>
                  <div className="w-24 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center font-semibold">
                    {lessonEquation.b}
                  </div>
                </div>
                <p className="mt-6 text-sm text-slate-600">
                  The total is {lessonEquation.b}. How many are in the x section?
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600">
                <p className="font-semibold text-slate-700">Think aloud:</p>
                <ul className="mt-3 list-disc space-y-2 pl-4">
                  <li>The bar has x plus {lessonEquation.a}.</li>
                  <li>We need to remove {lessonEquation.a} from the total.</li>
                  <li>x = {lessonEquation.b} - {lessonEquation.a}.</li>
                </ul>
              </div>
            </div>
          )}

          {lessonIndex === 2 && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm font-semibold text-slate-600">Equation</p>
                <div className="mt-6 text-2xl font-bold text-slate-900">{lessonEquation.text}</div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Step 1: Subtract {lessonEquation.a} from both sides.</p>
                  <p>Step 2: x = {lessonEquation.b - lessonEquation.a}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600">
                <p className="font-semibold text-slate-700">Coach prompts</p>
                <ul className="mt-3 list-disc space-y-2 pl-4">
                  <li>What keeps the equation balanced?</li>
                  <li>What inverse operation helps isolate x?</li>
                  <li>Check by substituting your answer.</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={handleNextLesson}
              className="rounded-full bg-brand-600 px-6 py-3 text-lg font-semibold text-white"
            >
              {lessonIndex < 2 ? "Next" : "Practice"}
            </button>
            <button
              type="button"
              onClick={() => setStep("scenario")}
              className="rounded-full border border-slate-300 px-6 py-3 text-lg font-semibold text-slate-700"
            >
              Back
            </button>
          </div>
        </section>
      )}

      {step === "practice" && (
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Practice set</h2>
            <button
              type="button"
              onClick={regeneratePractice}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Regenerate practice
            </button>
          </div>
          <p className="mt-2 text-slate-600">8 questions: concrete, representational, and abstract.</p>

          <div className="mt-6 grid gap-6">
            {practiceSet.map((item, index) => (
              <div key={`practice-${index}`} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">
                      {index < 2 && "Concrete"}
                      {index >= 2 && index < 4 && "Representational"}
                      {index >= 4 && "Abstract"}
                    </p>
                    <p className="mt-1 text-slate-700">{buildScenarioPrompt(item, scenarioId || "sneakers", friendlyName)}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-500">Equation: {item.text}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={practiceAnswers[index]?.value ?? ""}
                      onChange={(event) => handlePracticeAnswer(index, event.target.value)}
                      className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-lg"
                      aria-label={`Answer for question ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => gradePractice(index)}
                      className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Check
                    </button>
                  </div>
                </div>
                {practiceAnswers[index]?.correct !== undefined && (
                  <p
                    className={`mt-3 text-sm font-semibold ${
                      practiceAnswers[index]?.correct ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {practiceAnswers[index]?.correct
                      ? "Correct!"
                      : `Not yet. x = ${item.solution}.`}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => setStep("exit")}
              className="rounded-full bg-brand-600 px-6 py-3 text-lg font-semibold text-white"
            >
              Exit Ticket
            </button>
            <button
              type="button"
              onClick={() => setStep("lesson")}
              className="rounded-full border border-slate-300 px-6 py-3 text-lg font-semibold text-slate-700"
            >
              Back
            </button>
          </div>
        </section>
      )}

      {step === "exit" && (
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Exit Ticket</h2>
          <p className="mt-2 text-slate-600">Two mixed questions to show mastery.</p>
          <div className="mt-6 grid gap-6">
            {exitSet.map((item, index) => (
              <div key={`exit-${index}`} className="rounded-2xl border border-slate-200 p-5">
                <p className="text-slate-700">{buildScenarioPrompt(item, scenarioId || "sneakers", friendlyName)}</p>
                <p className="mt-2 text-sm font-semibold text-slate-500">Equation: {item.text}</p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    value={exitAnswers[index]?.value ?? ""}
                    onChange={(event) => handleExitAnswer(index, event.target.value)}
                    className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-lg"
                    aria-label={`Exit answer ${index + 1}`}
                  />
                </div>
                {exitAnswers[index]?.correct !== undefined && (
                  <p
                    className={`mt-3 text-sm font-semibold ${
                      exitAnswers[index]?.correct ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {exitAnswers[index]?.correct
                      ? "Correct!"
                      : `Not yet. x = ${item.solution}.`}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={gradeExit}
              className="rounded-full bg-brand-600 px-6 py-3 text-lg font-semibold text-white"
            >
              Check Exit Ticket
            </button>
            <button
              type="button"
              onClick={() => setStep("practice")}
              className="rounded-full border border-slate-300 px-6 py-3 text-lg font-semibold text-slate-700"
            >
              Back to practice
            </button>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
            <p className="font-semibold">Mastery summary</p>
            <p className="mt-2">
              {masteryCount}/2 correct. {masteryCount === 2 ? "You are ready to move on!" : "Review the hints and try again."}
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
