import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Theme, ThemeService } from 'src/app/services/theme.service';
import { DeviceService } from 'src/app/services/device.service';
import { FileUploadComponent } from '../quiz-page/_component/file-upload/file-upload.component';

interface UploadStep {
  id: number;
  title: string;
  description: string;
  component: string;
  completed: boolean;
}

@Component({
  selector: 'app-file-upload-page',
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
    MatIconModule,
    FileUploadComponent
  ],
  templateUrl: './file-upload-page.component.html',
  styleUrl: './file-upload-page.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class FileUploadPageComponent implements OnInit {
  private themeService = inject(ThemeService);
  private deviceService = inject(DeviceService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isMobile = this.deviceService.isMobile;
  uploadForm: FormGroup;
  isLinear = true;
  currentStep = 0;

  uploadSteps: UploadStep[] = [
    {
      id: 1,
      title: 'Select Files',
      description: 'Choose the files you want to upload',
      component: 'file-select',
      completed: false
    },
    {
      id: 2,
      title: 'Review & Confirm',
      description: 'Review your selected files and confirm upload',
      component: 'file-review',
      completed: false
    },
    {
      id: 3,
      title: 'Upload Progress',
      description: 'Monitor the upload progress',
      component: 'file-progress',
      completed: false
    }
  ];

  constructor() {
    this.uploadForm = this.fb.group({
      files: [[], Validators.required],
      description: [''],
      tags: [[]],
      isPublic: [false]
    });
  }

  ngOnInit() {
    this.themeService.setTheme(Theme.Dark);
  }

  get currentStepData(): UploadStep {
    return this.uploadSteps[this.currentStep];
  }

  get isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.uploadSteps.length - 1;
  }

  get canGoNext(): boolean {
    return this.uploadForm.valid && !this.isLastStep;
  }

  get canGoBack(): boolean {
    return !this.isFirstStep;
  }

  goToNext() {
    if (this.canGoNext) {
      this.currentStep++;
      this.uploadSteps[this.currentStep - 1].completed = true;
    }
  }

  goToPrevious() {
    if (this.canGoBack) {
      this.currentStep--;
    }
  }

  onFileSelected(files: File[]) {
    this.uploadForm.patchValue({ files });
  }

  onStepComplete(stepId: number) {
    const step = this.uploadSteps.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
    }
  }

  onSubmit() {
    if (this.uploadForm.valid) {
      console.log('Upload form submitted:', this.uploadForm.value);
      // Handle file upload logic here
      this.uploadSteps[this.currentStep].completed = true;
    }
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  getStepStatus(stepIndex: number): 'completed' | 'current' | 'pending' {
    if (stepIndex < this.currentStep) return 'completed';
    if (stepIndex === this.currentStep) return 'current';
    return 'pending';
  }
} 