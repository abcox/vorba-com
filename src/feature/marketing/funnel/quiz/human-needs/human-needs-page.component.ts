import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HUMAN_NEEDS_ANSWER_OPTIONS, HumanNeedsAnswerId } from './human-needs.model';
import { HUMAN_NEEDS_QUESTIONS, HUMAN_NEEDS_VECTORS } from './human-needs-questionnaire';
import {
  buildHumanNeedsExportData,
  calculateHumanNeedsVectorScores
} from './human-needs-scoring';

@Component({
  selector: 'app-human-needs-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './human-needs-page.component.html',
  styleUrl: './human-needs-page.component.scss'
})
/** Presents the Human Needs questionnaire and its vector score breakdown. */
export class HumanNeedsPageComponent {
  private pendingAdvance: ReturnType<typeof setTimeout> | null = null;

  @ViewChild('questionHeading') private questionHeading?: ElementRef<HTMLHeadingElement>;

  readonly questions = HUMAN_NEEDS_QUESTIONS;
  readonly vectors = HUMAN_NEEDS_VECTORS;
  readonly answerOptions = HUMAN_NEEDS_ANSWER_OPTIONS;
  readonly currentIndex = signal(0);
  readonly answers = signal<Partial<Record<string, HumanNeedsAnswerId>>>({});
  readonly showResults = signal(false);
  readonly previewIndex = signal<number | null>(null);
  readonly answeredCount = computed(() => this.questions.filter(
    (question) => this.answers()[question.id] !== undefined
  ).length);
  readonly lastReachableIndex = computed(() => {
    const firstUnanswered = this.questions.findIndex(
      (question) => this.answers()[question.id] === undefined
    );
    return firstUnanswered === -1 ? this.questions.length - 1 : firstUnanswered;
  });
  readonly scrubberPercent = computed(() =>
    (this.lastReachableIndex() / (this.questions.length - 1)) * 100
  );
  readonly currentQuestion = computed(() => this.questions[this.currentIndex()]);
  readonly currentAnswer = computed(() => this.answers()[this.currentQuestion().id]);
  readonly progressPercent = computed(() => (this.answeredCount() / this.questions.length) * 100);
  readonly scores = computed(() => calculateHumanNeedsVectorScores(
    this.questions,
    this.vectors,
    this.answers()
  ));
  readonly totalPercent = computed(() => {
    const scores = this.scores();
    return scores.maxTotal ? (scores.total / scores.maxTotal) * 100 : 0;
  });
  readonly exportData = computed(() => buildHumanNeedsExportData(
    this.questions,
    this.vectors,
    this.answers()
  ));
  readonly rankedResults = computed(() => this.vectors
    .map((vector) => {
      const scores = this.scores();
      const score = scores.byVector[vector.id];
      const maxScore = scores.maxByVector[vector.id];
      return {
        vector,
        score,
        maxScore,
        percentage: maxScore ? (score / maxScore) * 100 : 0
      };
    })
    .sort((first, second) => second.score - first.score));

  /** Previews a reachable question without navigating while the slider is being dragged. */
  previewQuestion(event: Event): void {
    this.clearPendingAdvance();
    const questionNumber = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isInteger(questionNumber)) {
      this.previewIndex.set(Math.max(0, Math.min(questionNumber - 1, this.lastReachableIndex())));
    }
  }

  /** Commits the slider position while keeping keyboard focus on the review control. */
  reviewQuestion(event: Event): void {
    this.previewQuestion(event);
    const index = this.previewIndex();
    if (index !== null) {
      this.currentIndex.set(index);
    }
    this.previewIndex.set(null);
  }

  selectAnswer(answerId: HumanNeedsAnswerId): void {
    this.clearPendingAdvance();
    const questionIndex = this.currentIndex();
    const questionId = this.currentQuestion().id;
    const hadAnswer = this.currentAnswer() !== undefined;
    this.answers.update((answers) => ({ ...answers, [questionId]: answerId }));
    if (hadAnswer) {
      return;
    }

    this.pendingAdvance = setTimeout(() => {
      this.pendingAdvance = null;
      if (this.currentIndex() === questionIndex && this.currentAnswer() === answerId) {
        this.nextQuestionOrShowResults();
      }
    }, 500);
  }

  previousQuestion(): void {
    this.clearPendingAdvance();
    this.previewIndex.set(null);
    if (this.currentIndex() > 0) {
      this.currentIndex.update((index) => index - 1);
      this.focusQuestionHeading();
    }
  }

  nextQuestionOrShowResults(): void {
    this.clearPendingAdvance();
    this.previewIndex.set(null);
    if (!this.currentAnswer()) {
      return;
    }

    if (this.currentIndex() === this.questions.length - 1) {
      this.showResults.set(true);
      return;
    }

    this.currentIndex.update((index) => index + 1);
    this.focusQuestionHeading();
  }

  startOver(): void {
    this.clearPendingAdvance();
    this.previewIndex.set(null);
    this.answers.set({});
    this.currentIndex.set(0);
    this.showResults.set(false);
  }

  /** Exports assessment answers, vector subtotals, and total score as a downloaded JSON file. */
  downloadResults(): void {
    const data = this.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'human-needs-results.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  private clearPendingAdvance(): void {
    if (this.pendingAdvance !== null) {
      clearTimeout(this.pendingAdvance);
      this.pendingAdvance = null;
    }
  }

  /**
   * Moves focus away from the reused answer radio so arrow keys cannot answer the next question.
   * Defers focus until Angular has rendered the updated question heading.
   */
  private focusQuestionHeading(): void {
    setTimeout(() => this.questionHeading?.nativeElement.focus());
  }
}