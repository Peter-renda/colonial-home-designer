export type QuestionType = "select" | "multiselect" | "text";

export type ArchitecturalStyle = "Federal" | "Georgian" | "Greek Revival";

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
  questions: QuizQuestion[];
}

export type QuizAnswers = Record<string, string | string[]>;

export interface StyleScores {
  Federal: number;
  Georgian: number;
  "Greek Revival": number;
}
