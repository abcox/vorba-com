import { Component, HostListener, inject, OnInit, Signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { Theme, ThemeService } from 'src/app/services/theme.service';
import { MatIconModule } from '@angular/material/icon';
import { DeviceService } from 'src/app/services/device.service';
import { QuizResponseDto, QuizDto, QuizService, QuizQuestionDto, QuizQuestionOptionDto, UserService, SubmitQuizActionDto } from '@file-service-api/v1';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { clearSessionId, getSessionId } from 'src/app/shared/utils';
//import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';

/* interface QuizQuestionOption {
  id: number;
  content: string;
  archetypeId: number;
  context: string;
} */

/* interface QuizQuestion {
  id: number;
  content: string;
  dimension: string;
  options: QuizQuestionOption[];
} */

/* interface Quiz {
  title: string;
  questions: QuizQuestion[];
} */

@Component({
  selector: 'app-quiz-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatButtonToggleModule,
    MatIconModule
  ],
  templateUrl: './quiz-page.component.html',
  styleUrl: './quiz-page.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class QuizPageComponent implements OnInit {
  quizService = inject(QuizService);
  userService = inject(UserService);
  isMobile = inject(DeviceService).isMobile;
  @ViewChild('stepper') stepper!: MatStepper;
  quizForm: FormGroup;
  quizId: string | null = null;
  isLinear = false; // was true;
  //currentStep = signal(0);
  //percentageCompleted = computed(() => this.currentStep() / this.quiz.length * 100);

  quiz: Signal<QuizDto | null>/*  = signal(this.quizData) */;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private router: Router
  ) {
    // Initialize with empty form - will be populated when quiz data loads
    this.quizForm = this.fb.group({});

    const quiz$ = this.route.queryParams.pipe(
      switchMap((params) => {
        console.log('Params:', params);
        const title = params['title'];
        if (!title) {
          throw new Error('Quiz title is required');
        }
        console.log('Quiz title:', title);
        const quizResponse = this.quizService.quizControllerGetQuizByTitle(title) as Observable<QuizResponseDto>;
        return quizResponse;
      }),
      map((response: QuizResponseDto) => { // todo: fix this --> we need to make response model in the api
        console.log('response', response);
        if (response.success) {
          const quiz = response.data as QuizDto;
          // Create form controls dynamically based on actual quiz questions
          this.createFormControls(quiz);
          return quiz;
        }
        return null;
      }),
      takeUntilDestroyed()
    );
    this.quiz = toSignal<QuizDto | null>(quiz$, { initialValue: null });
  }

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id');

    // set theme to light
    this.themeService.setTheme(Theme.Light);
  }

  private createFormControls(quiz: QuizDto) {
    const controls: { [key: string]: any } = {};
    
    // Create form controls for each question using the actual question ID
    quiz.questions.forEach(question => {
      controls[`question${question.id}`] = ['', Validators.required];
      console.log(`Created control for question${question.id} with ID: ${question.id}`);
    });
    
    // Update the form with the new controls
    this.quizForm = this.fb.group(controls);
    
    // Subscribe to form value changes for debugging
    this.quizForm.valueChanges.subscribe(value => {
      console.log('Form value changed:', value);
      // upsert to api
      const quizActionData = this.quizActionData;
      this.userService.userControllerSubmitQuizAction(quizActionData).pipe(tap(response => {
        console.log('Action submitted successfully:', response);
      }),
      catchError((error) => {
        console.error('Error submitting action:', error);
        return of(null);
      })).subscribe();
    });
    
    console.log('Form controls created:', Object.keys(controls));
    console.log('Quiz questions:', quiz.questions.map(q => ({ id: q.id, content: q.content.substring(0, 50) + '...' })));
  }

  get quizActionData(): SubmitQuizActionDto {
    return {
      userId: 'temp-user-id', // TODO: Remove when backend extracts from JWT
      quizId: this.quizId || '',
      sessionId: getSessionId(),
      action: 'answer',
      questionId: this.currentQuestionId,
      selectedOptionId: this.quizForm.value[`question${this.currentQuestionId}`],
    };
  }

  get currentQuestionId(): number {
    return (this.stepper?.selectedIndex ?? 0) + 1;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionId === 1;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionId === this.quiz()?.questions.length;
  }

  get currentQuestion(): QuizQuestionDto | undefined {
    return this.quiz()?.questions[this.currentQuestionId - 1];
  }



  // instead of using stepControl, and stepper.previous(), we use this method to go to the previous step
  // because stepper.previous() is not working as expected (i.e. stepping back 2 steps)
  goToNext() {
    //console.log('goToNext', this.stepper.selectedIndex);
    if (this.stepper.selectedIndex < (this.quiz()?.questions.length ?? 0) - 1) {
      this.stepper.selectedIndex = this.stepper.selectedIndex + 1;
      //this.cdr.detectChanges();
    }
  }
  
  goToPrevious() {
    console.log('goToPrevious', this.stepper.selectedIndex);
    if (this.stepper.selectedIndex > 0) {
      this.stepper.selectedIndex = this.stepper.selectedIndex - 1;
      //this.cdr.detectChanges();
    }
  }

  /* onOptionSelected(questionId: number, archetypeId: number, optionContent: string) {
    console.log(`Option selected for question ${questionId}:`, {
      archetypeId,
      optionContent: optionContent.substring(0, 50) + '...',
      formControlName: `question${questionId}`,
      currentFormValue: this.quizForm.get(`question${questionId}`)?.value
    });
  } */

  onOptionClick(option: QuizQuestionOptionDto) {
    console.log('Option clicked:', option);
    // NOTE: see valueChanges for form value changes
    // Add a small delay to ensure form validation and value change have completed
    setTimeout(() => {
      // Check if current question is valid and not the last question
      if (this.isCurrentQuestionValid() && !this.isLastQuestion) {
        this.goToNext();
      }
    }, 500); // 100ms delay
  }

  onSubmit() {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form valid:', this.quizForm.valid);
    console.log('Form value:', this.quizForm.value);
    console.log('Form controls:', Object.keys(this.quizForm.controls));
    
    // Check each question individually
    this.quiz()?.questions.forEach(question => {
      const control = this.quizForm.get(`question${question.id}`);
      console.log(`Question ${question.id}:`, {
        controlExists: !!control,
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors
      });
    });
    
    if (this.quizForm.valid) {
      console.log('Form submitted successfully');
      
      // TODO: Submit action "complete"
      this.userService.userControllerSubmitQuizAction(this.quizActionData).pipe(
        tap(() => {
          console.log('Action submitted successfully');

          clearSessionId();
      
          // Navigate to quiz end page with completion data
          const answeredQuestions = this.getAnsweredQuestionsCount();
          const totalQuestions = this.quiz()?.questions.length || 0;
          
          this.router.navigate(['/quiz', this.quizId, 'upload'], {
            queryParams: {
              quizTitle: this.quiz()?.title || 'Quiz',
              totalQuestions: totalQuestions,
              answeredQuestions: answeredQuestions
            }
          });
        }),
        catchError((error) => {
          console.error('Error submitting action:', error);
          // TODO: do we want to show error and have user retry?
          return of(null);
        })
      ).subscribe();
    } else {
      console.log('Form has validation errors');
    }
  }
  
  private getAnsweredQuestionsCount(): number {
    let count = 0;
    this.quiz()?.questions.forEach(question => {
      const control = this.quizForm.get(`question${question.id}`);
      if (control && control.value !== null && control.value !== undefined && control.value !== '') {
        count++;
      }
    });
    return count;
  }

  /* @HostListener('swipeleft', ['$event'])
  onSwipeLeft(event: any) {
    if (this.canGoNext()) {
      this.stepper.next();
    }
  }

  @HostListener('swiperight', ['$event'])
  onSwipeRight(event: any) {
    if (this.canGoBack()) {
      this.stepper.previous();
    }
  } */

  canGoNext() {
    //return this.currentStep() < this.quiz.length;
    return this.stepper.selectedIndex < (this.quiz()?.questions.length ?? 0);
  }

  canGoBack() {
    //return this.currentStep() > 0;
    return this.stepper.selectedIndex > 0;
  }

  isCurrentQuestionValid(): boolean {
    const currentQuestionId = this.currentQuestionId;
    const questionControl = this.quizForm.get(`question${currentQuestionId}`);
    return questionControl ? questionControl.valid : false;
  }

  //#region  // Swipe detection (native)  ***** EXPERIMENTAL *****
  //
  // TODO: review hammerjs as an alternative, more robust swipe detection
  // 
  //    (https://hammerjs.github.io/)
  //
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly SWIPE_THRESHOLD = 50; // Minimum px distance for swipe

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const diffX = this.touchStartX - touchEndX;
    const diffY = this.touchStartY - touchEndY;

    // Only trigger if horizontal swipe is greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.SWIPE_THRESHOLD) {
      if (diffX > 0 && this.canGoNext() && this.isCurrentQuestionValid()) {
        this.goToNext(); // Swipe left - use goToNext instead of stepper.next()
      } else if (diffX < 0 && this.canGoBack()) {
        this.goToPrevious(); // Swipe right - use goToPrevious instead of stepper.previous()
      }
    }
  }
  //#endregion  // Swipe detection
}
