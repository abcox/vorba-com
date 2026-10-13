export type HumanNeedsAnswerId = 'yes' | 'partly' | 'no';

export interface HumanNeedsAnswerOption {
  id: HumanNeedsAnswerId;
  label: string;
  score: number;
}

export const HUMAN_NEEDS_ANSWER_OPTIONS: readonly HumanNeedsAnswerOption[] = [
  { id: 'yes', label: 'Yes', score: 10 },
  { id: 'partly', label: 'Partly', score: 5 },
  { id: 'no', label: 'No', score: 0 }
];

export interface HumanNeedsVector {
  id: string;
  label: string;
}

export interface HumanNeedsQuestion {
  id: string;
  sourceRow: number;
  prompt: string;
  vectorId: string;
}

export type HumanNeedsAnswers = Readonly<Partial<Record<string, HumanNeedsAnswerId>>>;

export interface HumanNeedsVectorScores {
  byVector: Record<string, number>;
  maxByVector: Record<string, number>;
  total: number;
  maxTotal: number;
}

/** Formatted results payload for exporting or downloading assessment outcomes. */
export interface HumanNeedsExportData {
  answers: (HumanNeedsAnswerId | null)[];
  subtotals: Record<string, number>;
  total: number;
}