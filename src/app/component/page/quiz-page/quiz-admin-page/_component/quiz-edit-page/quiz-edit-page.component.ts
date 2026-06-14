import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService, QuizDto, QuizQuestionDto, QuizQuestionOptionDto } from '@file-service-api/v1';
import { NotifyService } from '@src/app/core/notify/notify.service';

@Component({
  selector: 'app-quiz-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './quiz-edit-page.component.html',
  styleUrl: './quiz-edit-page.component.scss'
})
export class QuizEditPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private quizService = inject(QuizService);
  private notifyService = inject(NotifyService);

  quizId = '';
  loading = false;
  loadError = '';
  quiz: QuizDto | null = null;
  hasQuestionChanges = false;
  dimensions: string[] = [];
  archetypes: number[] = [];
  newDimension = '';
  newArchetype = '';
  private pendingDeletedQuestions = new Map<number, { question: QuizQuestionDto; index: number }>();
  questionForms: Record<number, FormGroup> = {};
  optionForms: Record<number, Record<number, FormGroup>> = {};

  quizForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
  });

  get headerTitle(): string {
    const formTitle = this.quizForm.get('title')?.value?.trim();
    return formTitle || this.quiz?.title || 'Edit Quiz';
  }

  ngOnInit(): void {
    this.quizId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.quizId) {
      this.router.navigate(['/admin/quiz']);
      return;
    }

    this.loadQuiz();
  }

  private loadQuiz(): void {
    this.loading = true;
    this.loadError = '';

    this.quizService.quizControllerGetQuizById(this.quizId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.quiz = response.data;
          this.quizForm.patchValue({ title: this.quiz.title });
          this.initializeQuestionForms(this.quiz.questions);
          this.initializeOptionForms(this.quiz.questions);
          this.initializeTaxonomy(this.quiz.questions);
        } else {
          this.loadError = response.message ?? 'Quiz not found.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.loadError = err?.message ?? 'Failed to load quiz.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }

    // TODO: connect save/update import flow
    console.log('Save quiz draft:', this.quizId, this.quizForm.value);
  }

  onCancel(): void {
    this.router.navigate(['/admin/quiz']);
  }

  trackQuestion(_index: number, question: QuizQuestionDto): number {
    return question.id;
  }

  trackOption(_index: number, option: QuizQuestionOptionDto): number {
    return option.id;
  }

  trackDimension(_index: number, dimension: string): string {
    return dimension;
  }

  trackArchetype(_index: number, archetype: number): number {
    return archetype;
  }

  getOptionForm(questionId: number, optionId: number): FormGroup | null {
    return this.optionForms[questionId]?.[optionId] ?? null;
  }

  getOptionFormGroup(questionId: number, optionId: number): FormGroup | null {
    return this.optionForms[questionId]?.[optionId] ?? null;
  }

  addQuestion(): void {
    if (!this.quiz) {
      return;
    }

    const nextQuestionId = this.getNextQuestionId(this.quiz.questions);
    const nextOptionBaseId = this.getNextOptionId(this.quiz.questions);

    const newQuestion: QuizQuestionDto = {
      id: nextQuestionId,
      content: `New question ${nextQuestionId}`,
      dimension: 'General',
      options: [
        {
          id: nextOptionBaseId,
          content: 'Option 1',
          archetypeId: 1,
          context: ''
        },
        {
          id: nextOptionBaseId + 1,
          content: 'Option 2',
          archetypeId: 2,
          context: ''
        }
      ]
    };

    this.quiz.questions = [...this.quiz.questions, newQuestion];
    this.questionForms[newQuestion.id] = this.createQuestionForm(newQuestion);
    this.optionForms[newQuestion.id] = this.createOptionForms(newQuestion.options);
    this.hasQuestionChanges = true;
  }

  duplicateQuestion(questionId: number): void {
    if (!this.quiz) {
      return;
    }

    const sourceIndex = this.quiz.questions.findIndex((item) => item.id === questionId);
    if (sourceIndex < 0) {
      return;
    }

    const sourceQuestion = this.quiz.questions[sourceIndex];
    const nextQuestionId = this.getNextQuestionId(this.quiz.questions);
    const nextOptionBaseId = this.getNextOptionId(this.quiz.questions);

    const duplicatedQuestion: QuizQuestionDto = {
      id: nextQuestionId,
      content: `Copy of ${sourceQuestion.content}`,
      dimension: sourceQuestion.dimension,
      options: sourceQuestion.options.map((option, index) => ({
        id: nextOptionBaseId + index,
        content: option.content,
        archetypeId: option.archetypeId,
        context: option.context
      }))
    };

    const nextQuestions = [...this.quiz.questions];
    nextQuestions.splice(sourceIndex + 1, 0, duplicatedQuestion);
    this.quiz.questions = nextQuestions;
    this.questionForms[duplicatedQuestion.id] = this.createQuestionForm(duplicatedQuestion);
    this.optionForms[duplicatedQuestion.id] = this.createOptionForms(duplicatedQuestion.options);
    this.hasQuestionChanges = true;

    this.notifyService.copied();
  }

  saveQuestionChanges(): void {
    if (!this.quiz) {
      return;
    }

    const updatedQuestions = this.quiz.questions.map((question) => {
      const questionForm = this.questionForms[question.id];
      if (!questionForm) {
        return question;
      }

      const updatedOptions = (this.optionForms[question.id] ? question.options.map((option) => {
        const optionForm = this.optionForms[question.id][option.id];
        if (!optionForm) {
          return option;
        }

        return {
          ...option,
          content: optionForm.get('content')?.value ?? option.content,
          archetypeId: this.toNumber(optionForm.get('archetypeId')?.value, option.archetypeId),
          context: optionForm.get('context')?.value ?? option.context
        };
      }) : question.options);

      return {
        ...question,
        content: questionForm.get('content')?.value ?? question.content,
        dimension: questionForm.get('dimension')?.value ?? question.dimension,
        options: updatedOptions
      };
    });

    this.quiz.questions = updatedQuestions;
    this.hasQuestionChanges = false;
    this.notifyService.saved();
  }

  deleteQuestion(questionId: number): void {
    if (!this.quiz) {
      return;
    }

    if (this.pendingDeletedQuestions.has(questionId)) {
      return;
    }

    const questionIndex = this.quiz.questions.findIndex((item) => item.id === questionId);
    if (questionIndex < 0) {
      return;
    }

    const question = this.quiz.questions[questionIndex];
    this.pendingDeletedQuestions.set(questionId, { question, index: questionIndex });
    delete this.questionForms[questionId];
    delete this.optionForms[questionId];

    this.quiz.questions = this.quiz.questions.filter((item) => item.id !== questionId);
    this.hasQuestionChanges = true;

    this.notifyService.withAction(`Question Q${questionId} deleted`, 'Undo', { duration: 5000 }).subscribe((result) => {
      const pendingDelete = this.pendingDeletedQuestions.get(questionId);
      this.pendingDeletedQuestions.delete(questionId);

      if (!result.dismissedByAction || !this.quiz || !pendingDelete) {
        return;
      }

      const alreadyRestored = this.quiz.questions.some((item) => item.id === questionId);
      if (alreadyRestored) {
        return;
      }

      const restoreIndex = Math.min(pendingDelete.index, this.quiz.questions.length);
      const nextQuestions = [...this.quiz.questions];
      nextQuestions.splice(restoreIndex, 0, pendingDelete.question);
      this.quiz.questions = nextQuestions;
      this.questionForms[questionId] = this.createQuestionForm(pendingDelete.question);
      this.optionForms[questionId] = this.createOptionForms(pendingDelete.question.options);
    });
  }

  addOption(questionId: number): void {
    if (!this.quiz) {
      return;
    }

    const question = this.quiz.questions.find((item) => item.id === questionId);
    if (!question) {
      return;
    }

    const nextOptionId = this.getNextOptionId(this.quiz.questions);
    const newOption: QuizQuestionOptionDto = {
      id: nextOptionId,
      content: `Option ${question.options.length + 1}`,
      archetypeId: question.options.length + 1,
      context: ''
    };

    question.options = [...question.options, newOption];
    this.optionForms[questionId] = {
      ...(this.optionForms[questionId] ?? {}),
      [newOption.id]: this.createOptionForm(newOption)
    };
    this.hasQuestionChanges = true;
  }

  duplicateOption(questionId: number, optionId: number): void {
    if (!this.quiz) {
      return;
    }

    const question = this.quiz.questions.find((item) => item.id === questionId);
    if (!question) {
      return;
    }

    const sourceIndex = question.options.findIndex((item) => item.id === optionId);
    if (sourceIndex < 0) {
      return;
    }

    const sourceOption = question.options[sourceIndex];
    const duplicatedOption: QuizQuestionOptionDto = {
      id: this.getNextOptionId(this.quiz.questions),
      content: `Copy of ${sourceOption.content}`,
      archetypeId: sourceOption.archetypeId,
      context: sourceOption.context
    };

    const nextOptions = [...question.options];
    nextOptions.splice(sourceIndex + 1, 0, duplicatedOption);
    question.options = nextOptions;
    this.optionForms[questionId] = {
      ...(this.optionForms[questionId] ?? {}),
      [duplicatedOption.id]: this.createOptionForm(duplicatedOption)
    };
    this.hasQuestionChanges = true;
    this.notifyService.copied();
  }

  deleteOption(questionId: number, optionId: number): void {
    if (!this.quiz) {
      return;
    }

    const question = this.quiz.questions.find((item) => item.id === questionId);
    if (!question) {
      return;
    }

    const nextOptions = question.options.filter((item) => item.id !== optionId);
    if (nextOptions.length === question.options.length) {
      return;
    }

    question.options = nextOptions;
    if (this.optionForms[questionId]) {
      delete this.optionForms[questionId][optionId];
    }
    this.hasQuestionChanges = true;
    this.notifyService.deleted();
  }

  dropQuestion(event: CdkDragDrop<QuizQuestionDto[]>): void {
    if (!this.quiz || event.previousIndex === event.currentIndex) {
      return;
    }

    moveItemInArray(
      this.quiz.questions,
      event.previousIndex,
      event.currentIndex,
    );
    this.hasQuestionChanges = true;
  }

  dropOption(questionId: number, event: CdkDragDrop<QuizQuestionOptionDto[]>): void {
    if (!this.quiz || event.previousIndex === event.currentIndex) {
      return;
    }

    const question = this.quiz.questions.find((item) => item.id === questionId);
    if (!question) {
      return;
    }

    moveItemInArray(
      question.options,
      event.previousIndex,
      event.currentIndex,
    );
    this.hasQuestionChanges = true;
  }

  getOptionSummary(question: QuizQuestionDto): string {
    return question.options.map((option) => option.content).join(' | ');
  }

  addDimension(): void {
    const value = this.newDimension.trim();
    if (!value || this.dimensions.includes(value)) {
      return;
    }

    this.dimensions = [...this.dimensions, value];
    this.newDimension = '';
  }

  removeDimension(value: string): void {
    this.dimensions = this.dimensions.filter((item) => item !== value);
  }

  addArchetype(): void {
    const parsed = Number(this.newArchetype);
    if (!Number.isFinite(parsed)) {
      return;
    }

    const value = Math.trunc(parsed);
    if (this.archetypes.includes(value)) {
      return;
    }

    this.archetypes = [...this.archetypes, value].sort((a, b) => a - b);
    this.newArchetype = '';
  }

  removeArchetype(value: number): void {
    this.archetypes = this.archetypes.filter((item) => item !== value);
  }

  private getNextQuestionId(questions: QuizQuestionDto[]): number {
    if (!questions.length) {
      return 1;
    }

    return Math.max(...questions.map((question) => question.id)) + 1;
  }

  private getNextOptionId(questions: QuizQuestionDto[]): number {
    const allOptionIds = questions.flatMap((question) => question.options.map((option) => option.id));

    if (!allOptionIds.length) {
      return 1;
    }

    return Math.max(...allOptionIds) + 1;
  }

  private initializeQuestionForms(questions: QuizQuestionDto[]): void {
    this.questionForms = questions.reduce<Record<number, FormGroup>>((forms, question) => {
      forms[question.id] = this.createQuestionForm(question);
      return forms;
    }, {});
  }

  private initializeOptionForms(questions: QuizQuestionDto[]): void {
    this.optionForms = questions.reduce<Record<number, Record<number, FormGroup>>>((forms, question) => {
      forms[question.id] = this.createOptionForms(question.options);
      return forms;
    }, {});
  }

  private initializeTaxonomy(questions: QuizQuestionDto[]): void {
    const dimensions = questions
      .map((question) => question.dimension?.trim())
      .filter((dimension): dimension is string => !!dimension);

    const archetypes = questions.flatMap((question) =>
      question.options
        .map((option) => option.archetypeId)
        .filter((archetype): archetype is number => Number.isFinite(archetype))
    );

    this.dimensions = Array.from(new Set(dimensions));
    this.archetypes = Array.from(new Set(archetypes)).sort((a, b) => a - b);
  }

  private createQuestionForm(question: QuizQuestionDto): FormGroup {
    return this.fb.group({
      content: [question.content, [Validators.required, Validators.minLength(3)]],
      dimension: [question.dimension, [Validators.required]]
    });
  }

  private createOptionForms(options: QuizQuestionOptionDto[]): Record<number, FormGroup> {
    return options.reduce<Record<number, FormGroup>>((forms, option) => {
      forms[option.id] = this.createOptionForm(option);
      return forms;
    }, {});
  }

  private createOptionForm(option: QuizQuestionOptionDto): FormGroup {
    return this.fb.group({
      content: [option.content, [Validators.required, Validators.minLength(1)]],
      archetypeId: [option.archetypeId, [Validators.required]],
      context: [option.context]
    });
  }

  private toNumber(value: unknown, fallback: number): number {
    const parsed = typeof value === 'string' ? Number(value) : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}