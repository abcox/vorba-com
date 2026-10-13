import {
  HUMAN_NEEDS_ANSWER_OPTIONS,
  HumanNeedsQuestion,
  HumanNeedsVector
} from './human-needs.model';
import { HUMAN_NEEDS_QUESTIONS, HUMAN_NEEDS_VECTORS } from './human-needs-questionnaire';
import {
  buildHumanNeedsExportData,
  calculateHumanNeedsVectorScores
} from './human-needs-scoring';

describe('calculateHumanNeedsVectorScores', () => {
  it('presents answers in Yes, Partly, No order with the workbook scores', () => {
    expect(HUMAN_NEEDS_ANSWER_OPTIONS).toEqual([
      { id: 'yes', label: 'Yes', score: 10 },
      { id: 'partly', label: 'Partly', score: 5 },
      { id: 'no', label: 'No', score: 0 }
    ]);
  });

  const vectors: HumanNeedsVector[] = [
    { id: 'security', label: 'Security' },
    { id: 'belonging', label: 'Belonging' }
  ];
  const questions: HumanNeedsQuestion[] = [
    { id: 'q1', sourceRow: 10, prompt: 'Question one', vectorId: 'security' },
    { id: 'q2', sourceRow: 11, prompt: 'Question two', vectorId: 'belonging' }
  ];

  it('scores each answer into its question vector using the answer option score', () => {
    expect(calculateHumanNeedsVectorScores(questions, vectors, {
      q1: 'yes',
      q2: 'partly'
    })).toEqual({
      byVector: { security: 10, belonging: 5 },
      maxByVector: { security: 10, belonging: 10 },
      total: 15,
      maxTotal: 20
    });
  });

  it('leaves unanswered questions and zero-weight answers at zero', () => {
    expect(calculateHumanNeedsVectorScores(questions, vectors, { q2: 'no' })).toEqual({
      byVector: { security: 0, belonging: 0 },
      maxByVector: { security: 10, belonging: 10 },
      total: 0,
      maxTotal: 20
    });
  });

  it('matches the workbook question count and vector maximum scores', () => {
    const allYesAnswers = Object.fromEntries(HUMAN_NEEDS_QUESTIONS.map((question) => [question.id, 'yes' as const]));

    expect(HUMAN_NEEDS_QUESTIONS.length).toBe(84);
    expect(calculateHumanNeedsVectorScores(
      HUMAN_NEEDS_QUESTIONS,
      HUMAN_NEEDS_VECTORS,
      allYesAnswers
    )).toEqual({
      byVector: {
        significant: 140,
        love: 140,
        certainty: 150,
        uncertainty: 130,
        growth: 140,
        contribution: 140
      },
      maxByVector: {
        significant: 140,
        love: 140,
        certainty: 150,
        uncertainty: 130,
        growth: 140,
        contribution: 140
      },
      total: 840,
      maxTotal: 840
    });
  });
});

describe('buildHumanNeedsExportData', () => {
  const vectors: HumanNeedsVector[] = [
    { id: 'security', label: 'Security' },
    { id: 'belonging', label: 'Belonging' }
  ];
  const questions: HumanNeedsQuestion[] = [
    { id: 'q1', sourceRow: 10, prompt: 'Question one', vectorId: 'security' },
    { id: 'q2', sourceRow: 11, prompt: 'Question two', vectorId: 'belonging' },
    { id: 'q3', sourceRow: 12, prompt: 'Question three', vectorId: 'security' }
  ];

  it('formats answers array in question order with vector subtotals and total', () => {
    const result = buildHumanNeedsExportData(questions, vectors, {
      q1: 'yes',
      q2: 'partly',
      q3: 'no'
    });

    expect(result).toEqual({
      answers: ['yes', 'partly', 'no'],
      subtotals: {
        security: 10,
        belonging: 5
      },
      total: 15
    });
  });

  it('sets null for unanswered questions while correctly summing answered vectors', () => {
    const result = buildHumanNeedsExportData(questions, vectors, {
      q2: 'yes'
    });

    expect(result).toEqual({
      answers: [null, 'yes', null],
      subtotals: {
        security: 0,
        belonging: 10
      },
      total: 10
    });
  });

  it('exports all 84 answers and vector subtotals across the questionnaire', () => {
    const allYesAnswers = Object.fromEntries(
      HUMAN_NEEDS_QUESTIONS.map((question) => [question.id, 'yes' as const])
    );
    const result = buildHumanNeedsExportData(
      HUMAN_NEEDS_QUESTIONS,
      HUMAN_NEEDS_VECTORS,
      allYesAnswers
    );

    expect(result.answers.length).toBe(84);
    expect(result.answers.every((answer) => answer === 'yes')).toBeTrue();
    expect(result.subtotals).toEqual({
      significant: 140,
      love: 140,
      certainty: 150,
      uncertainty: 130,
      growth: 140,
      contribution: 140
    });
    expect(result.total).toBe(840);
  });
});