import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Subject, take } from 'rxjs';

type Segment = 'individual' | 'smb' | 'enterprise';
type ValueBand = 'B1' | 'B2' | 'B3';
type IndividualServiceChoice = 'coaching_mentoring' | 'discussion_forum' | 'free_offerings';
type ProblemValueChoice = 'ind_helpful' | 'ind_gain' | 'ind_major' | 'ind_critical' | 'smb_under_100k' | 'smb_100k_500k' | 'smb_500k_2m' | 'smb_over_2m' | 'ent_100k' | 'ent_1m' | 'ent_10m' | 'ent_100m_plus';
type PathChoice = 'book_paid' | 'waitlist' | 'free_plan';
type PaymentMode = 'deposit' | 'full';
type StepId =
  | 'segment'
  | 'individual-service'
  | 'team-sizing'
  | 'problem-value'
  | 'value-band'
  | 'readiness'
  | 'contact'
  | 'path-choice'
  | 'booking-options'
  | 'enterprise-intake'
  | 'review';

interface DurationPricing {
  durationMinutes: number;
  deposit: number;
  full: number;
}

interface ProblemValueCard {
  value: ProblemValueChoice;
  label: string;
  sublabel: string;
}

const STEPS_BY_SEGMENT: Record<Segment, StepId[]> = {
  individual: ['segment', 'individual-service', 'path-choice', 'review'],
  smb:        ['segment', 'team-sizing', 'problem-value', 'value-band', 'readiness', 'contact', 'path-choice', 'review'],
  enterprise: ['segment', 'enterprise-intake', 'contact', 'review'],
};

@Component({
  selector: 'app-fit-assessment-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
  ],
  templateUrl: './fit-assessment-page.component.html',
  styleUrl: './fit-assessment-page.component.scss',
})
export class FitAssessmentPageComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject(ElementRef);
  private readonly destroy$ = new Subject<void>();

  // ── Pricing ──────────────────────────────────────────────────────────────
  private readonly pricingMatrix: Record<Segment, DurationPricing[]> = {
    individual: [
      { durationMinutes: 30, deposit: 125,  full: 250  },
      { durationMinutes: 60, deposit: 250,  full: 500  },
      { durationMinutes: 90, deposit: 500,  full: 900  },
    ],
    smb: [
      { durationMinutes: 30, deposit: 250,  full: 500  },
      { durationMinutes: 60, deposit: 500,  full: 1000 },
      { durationMinutes: 90, deposit: 1000, full: 1800 },
    ],
    enterprise: [
      { durationMinutes: 60, deposit: 1000, full: 2000 },
      { durationMinutes: 90, deposit: 2000, full: 3500 },
    ],
  };

  // ── Static option lists ───────────────────────────────────────────────────
  protected readonly segmentCards: Array<{ value: Segment; icon: string; label: string; sublabel: string }> = [
    { value: 'individual', icon: 'person',        label: 'Individual',  sublabel: 'Decision-maker advisory' },
    { value: 'smb',        icon: 'groups',         label: 'SMB',         sublabel: 'A small to mid-sized team' },
    { value: 'enterprise', icon: 'corporate_fare', label: 'Enterprise',  sublabel: 'Multi-team / large programs' },
  ];

  protected readonly problemValueCardsBySegment: Record<Segment, ProblemValueCard[]> = {
    individual: [
      { value: 'ind_helpful',  label: 'Helpful improvement',           sublabel: 'Nice-to-have and beneficial' },
      { value: 'ind_gain',     label: 'Meaningful productivity gain',  sublabel: 'Saves notable time and effort' },
      { value: 'ind_major',    label: 'Major business/career leverage',sublabel: 'Material upside for outcomes' },
      { value: 'ind_critical', label: 'Critical blocker removal',      sublabel: 'Urgent issue limiting progress' },
    ],
    smb: [
      { value: 'smb_under_100k', label: 'Under $100k',    sublabel: 'Localized impact' },
      { value: 'smb_100k_500k',  label: '$100k to $500k', sublabel: 'Team-level impact' },
      { value: 'smb_500k_2m',    label: '$500k to $2M',   sublabel: 'Business-critical impact' },
      { value: 'smb_over_2m',    label: 'Over $2M',       sublabel: 'Company-wide impact' },
    ],
    enterprise: [
      { value: 'ent_100k',      label: '$100k',   sublabel: 'Localized impact' },
      { value: 'ent_1m',        label: '$1M',     sublabel: 'Departmental scope' },
      { value: 'ent_10m',       label: '$10M',    sublabel: 'Business-unit scope' },
      { value: 'ent_100m_plus', label: '$100M+',  sublabel: 'Organisation-wide' },
    ],
  };

  protected readonly problemValueHeading = computed(() => {
    const seg = (this.formValue().segment || 'individual') as Segment;
    return seg === 'individual'
      ? 'What impact would solving this have for you?'
      : 'Over the next 12 months, what is the approximate business impact of solving this?';
  });

  protected readonly problemValueSubheading = computed(() => {
    const seg = (this.formValue().segment || 'individual') as Segment;
    return seg === 'individual'
      ? 'Consider time saved, stress reduced, and momentum gained.'
      : 'Think revenue protected, costs avoided, or strategic risk reduced.';
  });

  protected readonly problemValueCards = computed(() => {
    const seg = (this.formValue().segment || 'individual') as Segment;
    return this.problemValueCardsBySegment[seg];
  });

  protected readonly valueBandCards: Array<{ value: ValueBand; label: string; sublabel: string }> = [
    { value: 'B1', label: 'Local optimisation',  sublabel: 'Low revenue / risk impact' },
    { value: 'B2', label: 'Core workflow',        sublabel: 'Medium impact on delivery' },
    { value: 'B3', label: 'Mission critical',     sublabel: 'Revenue, reliability, or regulatory' },
  ];

  protected readonly readinessCards = [
    { value: 'now',     label: 'Ready now',        sublabel: '0 – 30 days' },
    { value: 'quarter', label: 'This quarter',     sublabel: '31 – 90 days' },
    { value: 'later',   label: 'Exploring',        sublabel: '90 + days' },
  ];

  protected readonly pathCards: Array<{ value: PathChoice; icon: string; label: string; sublabel: string }> = [
    { value: 'book_paid',  icon: 'calendar_month', label: 'Paid discovery session', sublabel: 'Choose duration + confirm with deposit or full payment' },
    { value: 'waitlist',   icon: 'event_available', label: 'Workshop waitlist',       sublabel: 'Priority access to upcoming architecture workshops' },
    { value: 'free_plan',  icon: 'bolt',            label: 'Free action plan',        sublabel: 'Tailored next steps delivered to your inbox' },
  ];

  protected readonly individualServiceCards: Array<{ value: IndividualServiceChoice; label: string; sublabel: string }> = [
    { value: 'coaching_mentoring', label: 'Coaching or mentoring', sublabel: 'One-on-one guidance and practical support' },
    { value: 'discussion_forum',   label: 'Join discussion forum', sublabel: 'Learn with peers and exchange proven approaches' },
    { value: 'free_offerings',     label: 'Free offerings',         sublabel: 'Start with resources and self-serve guidance' },
  ];

  protected readonly durationCards = computed(() => {
    const seg = (this.form.controls.segment.value || 'individual') as Segment;
    return this.pricingMatrix[seg].map(p => ({
      value: p.durationMinutes,
      label: `${p.durationMinutes} min`,
      sublabel: `Deposit $${p.deposit}  ·  Full $${p.full}`,
    }));
  });

  protected readonly paymentModeCards: Array<{ value: PaymentMode; label: string; sublabel: string }> = [
    { value: 'deposit', label: 'Pay deposit',  sublabel: 'Hold the slot now, balance due at session' },
    { value: 'full',    label: 'Pay in full',  sublabel: 'Settle everything upfront' },
  ];

  // ── Form ──────────────────────────────────────────────────────────────────
  protected readonly form = this.fb.group({
    firstName:        ['', [Validators.required]],
    organizationName: [''],
    email:            ['', [Validators.required, Validators.email]],
    phone:            [''],
    segment:          [null as Segment | null,    [Validators.required]],
    individualService:[null as IndividualServiceChoice | null, [Validators.required]],
    problemValueRange:[null as ProblemValueChoice | null, [Validators.required]],
    valueBand:        ['B2' as ValueBand,          [Validators.required]],
    readiness:        ['quarter',                 [Validators.required]],
    teamCount:        [null as number | null],
    averageTeamSize:  [null as number | null],
    selectedPath:     ['book_paid' as PathChoice, [Validators.required]],
    durationMinutes:  [60],
    paymentMode:      ['deposit' as PaymentMode],
    wantsBooking:     [false],
    notes:            [''],
  });

  constructor() {
    // Pre-fill contact fields from query params (e.g. ?contact=Ada&email=ada@co.com&phone=555-1234)
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      if (params['contact']) this.form.controls.firstName.setValue(params['contact']);
      if (params['email'])   this.form.controls.email.setValue(params['email']);
      if (params['phone'])   this.form.controls.phone.setValue(params['phone']);
    });

    // Auto-focus first unfilled field when contact step becomes active
    effect(() => {
      if (this.currentStep() !== 'contact') return;
      setTimeout(() => {
        const order = ['firstName', 'email', 'phone'] as const;
        const target = order.find(name => !this.form.controls[name].value) ?? order[0];
        const el = this.host.nativeElement.querySelector(`[formControlName="${target}"]`) as HTMLInputElement | null;
        el?.focus();
      });
    });
  }

  // ── Step state ────────────────────────────────────────────────────────────
  protected readonly currentStepIndex = signal(0);

  // Drive canAdvance reactively from form value changes (form controls are not signals)
  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  protected readonly steps = computed<StepId[]>(() => {
    const v = this.formValue(); // reactive dependency on form changes
    const seg = (v.segment || 'individual') as Segment;
    const steps = [...STEPS_BY_SEGMENT[seg]];
    // insert booking-options after path-choice when paid path is chosen
    const pathIdx = steps.indexOf('path-choice');
    if (pathIdx !== -1 && v.selectedPath === 'book_paid') {
      steps.splice(pathIdx + 1, 0, 'booking-options');
    }
    return steps;
  });

  protected readonly currentStep = computed<StepId>(() =>
    this.steps()[this.currentStepIndex()] ?? 'segment'
  );

  protected readonly totalSteps = computed(() => this.steps().length);
  protected readonly isFirst   = computed(() => this.currentStepIndex() === 0);
  protected readonly isLast    = computed(() => this.currentStepIndex() === this.totalSteps() - 1);

  protected readonly canAdvance = computed((): boolean => {
    const step = this.currentStep();
    const v = this.formValue(); // reactive — re-runs on every form change
    const f = this.form.controls;
    switch (step) {
      case 'segment':          return !!v.segment && f.firstName.valid;
      case 'individual-service': return !!v.individualService;
      case 'team-sizing':      return Number(v.teamCount) > 0 && Number(v.averageTeamSize) > 0;
      case 'problem-value':    return this.problemValueCards().some(card => card.value === v.problemValueRange);
      case 'value-band':       return !!v.valueBand;
      case 'readiness':        return !!v.readiness;
      case 'contact':          return f.firstName.valid && f.email.valid;
      case 'path-choice':      return !!v.selectedPath;
      case 'booking-options':  return !!v.durationMinutes && !!v.paymentMode;
      case 'enterprise-intake':return true;
      case 'review':           return false;
      default:                 return false;
    }
  });

  // ── Recommendation ────────────────────────────────────────────────────────
  protected readonly recommendedPath = computed<PathChoice>(() => {
    const { segment, valueBand, readiness, individualService } = this.form.getRawValue();
    if (segment === 'individual') {
      if (individualService === 'coaching_mentoring') return 'book_paid';
      if (individualService === 'discussion_forum') return 'waitlist';
      if (individualService === 'free_offerings') return 'free_plan';
    }
    if (segment === 'enterprise')                              return 'book_paid';
    if (valueBand === 'B3' && readiness !== 'later')           return 'book_paid';
    if (valueBand === 'B2')                                    return 'free_plan';
    if (valueBand === 'B1' && readiness === 'later')           return 'waitlist';
    return 'free_plan';
  });

  protected readonly quoteSummary = computed(() => {
    const { selectedPath, segment, durationMinutes, paymentMode } = this.form.getRawValue();
    if (selectedPath !== 'book_paid') return null;
    const seg = (segment || 'individual') as Segment;
    const dur = Number(durationMinutes || 60);
    const mode = (paymentMode || 'deposit') as PaymentMode;
    const pricing = this.pricingMatrix[seg].find(p => p.durationMinutes === dur);
    if (!pricing) return null;
    return { amount: mode === 'deposit' ? pricing.deposit : pricing.full, currency: 'USD', dur, mode };
  });

  // ── Submission ────────────────────────────────────────────────────────────
  protected readonly submittedPayload = signal<Record<string, unknown> | null>(null);

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Navigation ────────────────────────────────────────────────────────────
  protected next(): void {
    if (!this.canAdvance()) return;
    this.currentStepIndex.update(i => Math.min(i + 1, this.totalSteps() - 1));
  }

  protected back(): void {
    this.currentStepIndex.update(i => Math.max(i - 1, 0));
  }

  /** Select a card value on a form control and optionally auto-advance. */
  protected pick<T>(controlName: keyof typeof this.form.controls, value: T, autoAdvance = true): void {
    this.form.controls[controlName].setValue(value as never);
    if (autoAdvance) this.next();
  }

  protected isSelected(controlName: keyof typeof this.form.controls, value: unknown): boolean {
    return this.form.controls[controlName].value === value;
  }

  protected readonly individualServiceLabel = computed(() => {
    const selected = this.formValue().individualService;
    return this.individualServiceCards.find(card => card.value === selected)?.label ?? null;
  });

  protected pickIndividualService(value: IndividualServiceChoice): void {
    this.form.controls.individualService.setValue(value);
    if (value === 'coaching_mentoring') this.form.controls.selectedPath.setValue('book_paid');
    if (value === 'discussion_forum') this.form.controls.selectedPath.setValue('waitlist');
    if (value === 'free_offerings') this.form.controls.selectedPath.setValue('free_plan');
    this.next();
  }

  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submittedPayload.set({
      ...this.form.getRawValue(),
      recommendedPath: this.recommendedPath(),
      quoteSummary:    this.quoteSummary(),
      submittedAt:     new Date().toISOString(),
    });
  }
}
