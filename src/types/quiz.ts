export type QuestionType = "select" | "multiselect" | "text";

export type ArchitecturalStyle = "Federal" | "Georgian" | "Greek Revival";

export type QuizGroup = "structural" | "exterior" | "rooms";

export interface QuizQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  optional?: boolean;
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
