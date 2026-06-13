export type QuestionType = "select" | "multiselect" | "text" | "file" | "dimensions";

export type ArchitecturalStyle = "Federal" | "Georgian" | "Greek Revival";

export type QuizGroup = "site" | "structural" | "exterior" | "rooms" | "systems";

/** Show a question only when another answer matches one of these values. */
export interface ShowIf {
  questionId: string;
  equalsAny: string[];
}

export interface QuizQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  optional?: boolean;
  /** Accept attribute for file questions, e.g. "image/*" */
  accept?: string;
  /** Conditional visibility — hidden unless the referenced answer matches. */
  showIf?: ShowIf;
}

export interface QuizSection {
  id: string;
  title: string;
  subtitle?: string;
  group: QuizGroup;
  /** Optional sketch key — for the rooms group, identifies which room sketch to render. */
  sketchKey?: string;
  questions: QuizQuestion[];
}

export type QuizAnswers = Record<string, string | string[]>;

export interface StyleScores {
  Federal: number;
  Georgian: number;
  "Greek Revival": number;
}
