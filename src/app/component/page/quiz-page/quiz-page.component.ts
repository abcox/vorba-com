import { Component, computed, HostListener, OnInit, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute } from '@angular/router';
import { Theme, ThemeService } from 'src/app/services/theme.service';
import { MatIconModule } from '@angular/material/icon';
//import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';

interface QuizQuestionOption {
  id: number;
  content: string;
  archetypeId: number;
  context: string;
}

interface QuizQuestion {
  id: number;
  content: string;
  dimension: string;
  options: QuizQuestionOption[];
}

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
    MatRadioModule,
    MatIconModule
  ],
  templateUrl: './quiz-page.component.html',
  styleUrl: './quiz-page.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class QuizPageComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  quizForm: FormGroup;
  quizId: string | null = null;
  isLinear = false; // was true;
  //currentStep = signal(0);
  //percentageCompleted = computed(() => this.currentStep() / this.quiz.length * 100);

  quiz: QuizQuestion[] = [
    {
      id: 1,
      content: "When tackling a tricky work challenge, I'm most likely to…",
      dimension: "Problem Clarity",
      options: [
        {
          id: 1,
          content: "Come up with a completely new approach",
          archetypeId: 1,
          context: "Innovative Thinking"
        },
        {
          id: 2,
          content: "See how various elements of the project influence one another",
          archetypeId: 2,
          context: "Systems Thinking"
        },
        {
          id: 3,
          content: "Ask people I know in various roles for their input",
          archetypeId: 4,
          context: "Collaborative Input"
        },
        {
          id: 4,
          content: "Blend concepts from different domains",
          archetypeId: 3,
          context: "Cross-Disciplinary Insight"
        }
      ]
    },
    {
      id: 2,
      content: "My organization's main software roadblock seems to be…",
      dimension: "Problem Clarity",
      options: [
        {
          id: 1,
          content: "We don't know what's possible or where to begin",
          archetypeId: 2,
          context: "Lack of Vision"
        },
        {
          id: 2,
          content: "We've tried and failed to implement fixes in the past",
          archetypeId: 3,
          context: "Failed Attempts"
        },
        {
          id: 3,
          content: "We know what's needed but can't agree on who should do it",
          archetypeId: 4,
          context: "Lack of Ownership"
        },
        {
          id: 4,
          content: "We're underestimating the scale of what's required",
          archetypeId: 1,
          context: "Effort Misjudgment"
        }
      ]
    },
    {
      id: 3,
      content: "How would you describe your current strategic plan?",
      dimension: "Strategic Readiness",
      options: [
        {
          id: 1,
          content: "We don't have one yet",
          archetypeId: 3,
          context: "Lack of Strategic Framework"
        },
        {
          id: 2,
          content: "It's still in development",
          archetypeId: 1,
          context: "Emerging Strategy"
        },
        {
          id: 3,
          content: "It's well documented and in use",
          archetypeId: 2,
          context: "Operationalized Plan"
        },
        {
          id: 4,
          content: "We have one, but it's not tied to our software efforts",
          archetypeId: 4,
          context: "Misalignment"
        }
      ]
    },
    {
      id: 4,
      content: "What's the timeline for solving your biggest software barrier?",
      dimension: "Time Horizon",
      options: [
        {
          id: 1,
          content: "Yesterday—we're behind already",
          archetypeId: 4,
          context: "Urgent/Reactive"
        },
        {
          id: 2,
          content: "This quarter—we've allocated budget and resources",
          archetypeId: 2,
          context: "Planned Execution"
        },
        {
          id: 3,
          content: "Later this year—it's not the top priority yet",
          archetypeId: 3,
          context: "Deferred"
        },
        {
          id: 4,
          content: "No fixed timeline—we're still evaluating",
          archetypeId: 1,
          context: "Unstructured Timeline"
        }
      ]
    },
    {
      id: 5,
      content: "How would you describe your team's technical capacity?",
      dimension: "Resource Inventory",
      options: [
        {
          id: 1,
          content: "We're understaffed and under-skilled",
          archetypeId: 3,
          context: "Low Capacity"
        },
        {
          id: 2,
          content: "We have the right people, but they're stretched thin",
          archetypeId: 4,
          context: "Bandwith Constrained"
        },
        {
          id: 3,
          content: "We're actively growing or outsourcing talent",
          archetypeId: 1,
          context: "Scaling Talent"
        },
        {
          id: 4,
          content: "We have strong skills but struggle to align efforts",
          archetypeId: 2,
          context: "Coordination Gaps"
        }
      ]
    },
    {
      id: 6,
      content: "How confident are you that your current path will lead to success?",
      dimension: "Confidence Alignment",
      options: [
        {
          id: 1,
          content: "Very confident—we've solved similar problems before",
          archetypeId: 2,
          context: "Experienced Confidence"
        },
        {
          id: 2,
          content: "Somewhat confident—we're still testing assumptions",
          archetypeId: 3,
          context: "Experimental"
        },
        {
          id: 3,
          content: "Not confident—we lack clarity or progress",
          archetypeId: 4,
          context: "Uncertainty"
        },
        {
          id: 4,
          content: "Overconfident—we may be underestimating the effort",
          archetypeId: 1,
          context: "Blind Spots"
        }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private themeService: ThemeService
  ) {
    // Initialize form with empty controls for all questions
    const controls: { [key: string]: any } = {};
    for (let i = 1; i <= 6; i++) { // Assuming 6 questions
      controls[`question${i}`] = ['', Validators.required];
    }
    this.quizForm = this.fb.group(controls);
  }

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id');

    // set theme to light
    this.themeService.setTheme(Theme.Light);
  }


  // instead of using stepControl, and stepper.previous(), we use this method to go to the previous step
  // because stepper.previous() is not working as expected (i.e. stepping back 2 steps)
  goToNext() {
    console.log('goToNext', this.stepper.selectedIndex);
    if (this.stepper.selectedIndex < this.quiz.length - 1) {
      this.stepper.selectedIndex = this.stepper.selectedIndex + 1;
    }
  }
  
  goToPrevious() {
    console.log('goToPrevious', this.stepper.selectedIndex);
    if (this.stepper.selectedIndex > 0) {
      this.stepper.selectedIndex = this.stepper.selectedIndex - 1;
    }
  }

  onSubmit() {
    if (this.quizForm.valid) {
      console.log('Form submitted:', this.quizForm.value);
      // TODO: Submit answers to API
    }
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
    return this.stepper.selectedIndex < this.quiz.length;
  }

  canGoBack() {
    //return this.currentStep() > 0;
    return this.stepper.selectedIndex > 0;
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
      if (diffX > 0 && this.canGoNext()) {
        this.stepper.next(); // Swipe left
      } else if (diffX < 0 && this.canGoBack()) {
        this.stepper.previous(); // Swipe right
      }
    }
  }
  //#endregion  // Swipe detection
}
