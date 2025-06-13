import { Component, inject } from '@angular/core';
import { LayoutService } from '../../layout/_service/layout.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from '@backend-api/v1/api/email.service';
import { EmailServiceRequest } from '@backend-api/v1/model/emailServiceRequest';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { finalize, delay } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { ContactDialogComponent } from './_component/contact-dialog.component';

interface FakeApiConfig {
  shouldSucceed: boolean;
  delayMs?: number;
  errorMessage?: string;
}

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss'
})
export class ContactPageComponent {
  private emailService = inject(EmailService);
  private dialog = inject(MatDialog);
  layoutService = inject(LayoutService);
  private fb = inject(FormBuilder);
  
  contactForm: FormGroup;
  isSubmitting = false;
  useFakeApi = true; // Toggle this to switch between real and fake API
  fakeApiConfig: FakeApiConfig = {
    shouldSucceed: true,
    delayMs: 2000,
    errorMessage: 'Failed to send email. Please try again later.'
  };

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit() {
    this.layoutService.setTitlePrefix('Contact');
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `Must be at least ${requiredLength} characters`;
    }
    return '';
  }

  private fakeEmailApi(request: EmailServiceRequest): Observable<any> {
    const { shouldSucceed, delayMs = 2000, errorMessage } = this.fakeApiConfig;
    
    const response$ = shouldSucceed
      ? of({ success: true })
      : throwError(() => new Error(errorMessage));

    return response$.pipe(
      delay(delayMs)
    );
  }

  // Helper method to toggle fake API success/failure
  toggleFakeApiSuccess(shouldSucceed: boolean) {
    this.fakeApiConfig.shouldSucceed = shouldSucceed;
  }

  private showSuccessDialog() {
    this.dialog.open(ContactDialogComponent, {
      data: {
        title: 'Thank You!',
        message: 'Your message has been sent successfully. We will get back to you soon.',
        isSuccess: true,
        shouldNavigate: true
      },
      width: '350px',
      maxWidth: '90vw',
      panelClass: 'success-dialog'
    });
  }

  private showErrorDialog() {
    this.dialog.open(ContactDialogComponent, {
      data: {
        title: 'Oops!',
        message: 'There was an error sending your message. Please try again later.',
        isSuccess: false,
        shouldNavigate: false
      },
      width: '400px',
      maxWidth: '90vw'
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      const request: EmailServiceRequest = {
        recipientAddress: this.contactForm.value.email,
        subject: `Contact Form from ${this.contactForm.value.name}`,
        htmlContent: this.contactForm.value.message
      };

      // Choose between real and fake API
      const apiCall$ = this.useFakeApi 
        ? this.fakeEmailApi(request)
        : this.emailService.sendEmail(request);

      apiCall$.pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      ).subscribe({
        next: (response) => {
          console.log('API response:', response);
          this.showSuccessDialog();
          this.contactForm.reset();
        },
        error: (error) => {
          console.error('API error:', error);
          this.showErrorDialog();
        }
      });
    }
  }
}
