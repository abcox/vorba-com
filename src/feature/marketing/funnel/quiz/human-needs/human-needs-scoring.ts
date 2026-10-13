import {
  HUMAN_NEEDS_ANSWER_OPTIONS,
  HumanNeedsAnswers,
  HumanNeedsExportData,
  HumanNeedsQuestion,
  HumanNeedsVector,
  HumanNeedsVectorScores
} from './human-needs.model';

const answerScoreById = new Map(
  HUMAN_NEEDS_ANSWER_OPTIONS.map(({ id, score }) => [id, score])
);
const maxAnswerScore = Math.max(...HUMAN_NEEDS_ANSWER_OPTIONS.map(({ score }) => score));

/** Calculates raw and maximum scores for each vector and across the assessment. */
export function calculateHumanNeedsVectorScores(
  questions: readonly HumanNeedsQuestion[],
  vectors: readonly HumanNeedsVector[],
  answers: HumanNeedsAnswers
): HumanNeedsVectorScores {
  const byVector = Object.fromEntries(
    vectors.map((vector) => [vector.id, 0])
  ) as Record<string, number>;
  const maxByVector = Object.fromEntries(
    vectors.map((vector) => [vector.id, 0])
  ) as Record<string, number>;

  for (const question of questions) {
    if (!(question.vectorId in maxByVector)) {
      continue;
    }

    maxByVector[question.vectorId] += maxAnswerScore;
    const answer = answers[question.id];
    if (!answer) {
      continue;
    }

    byVector[question.vectorId] += answerScoreById.get(answer) ?? 0;
  }

  return {
    byVector,
    maxByVector,
    total: Object.values(byVector).reduce((sum, score) => sum + score, 0),
    maxTotal: Object.values(maxByVector).reduce((sum, score) => sum + score, 0)
  };
}

/** Formats assessment answers, vector subtotals, and overall score into a serializable export object. */
export function buildHumanNeedsExportData(
  questions: readonly HumanNeedsQuestion[],
  vectors: readonly HumanNeedsVector[],
  answers: HumanNeedsAnswers
): HumanNeedsExportData {
  const scores = calculateHumanNeedsVectorScores(questions, vectors, answers);

  return {
    answers: questions.map((question) => answers[question.id] ?? null),
    subtotals: scores.byVector,
    total: scores.total
  };
}