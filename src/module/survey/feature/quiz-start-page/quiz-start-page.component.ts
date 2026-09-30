import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '@src/app/core/auth/auth.service';
import { DialogService } from '@src/app/component/dialog/dialog.service';
import { UserRegistrationRequest } from '@file-service-api/v1';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotifyService } from '@src/app/core/notify/notify.service';

@Component({
  selector: 'app-quiz-start-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './quiz-start-page.component.html',
  styleUrl: './quiz-start-page.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class QuizStartPageComponent {
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  private notifyService = inject(NotifyService);
  quizForm: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.quizForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subscribeNewsletter: [false, [Validators.requiredTrue]]
      //termsAccepted: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit() {
    if (this.quizForm.valid) {
      console.log('quizForm.value', this.quizForm.value);
      // Handle form submission
      // TODO: submit to API and get response having GUID
      // that we can user to anonymously track the quiz
      // and on successful response, route to quiz page      this.router.navigate(['/quiz', response.guid]);
      //this.router.navigate(['/quiz', response.guid]);

      const request: UserRegistrationRequest = {
        email: this.quizForm.value.email,
        name: this.quizForm.value.name,
        password: this.quizForm.value.email,
        username: this.quizForm.value.email,
        //subscribeNewsletter: this.quizForm.value.subscribeNewsletter,
        //termsAccepted: true
      };

      this.loading.set(true);
      this.authService.register(request).pipe(
        finalize(() => this.loading.set(false)),
        catchError((error) => {
          console.error('register error', error);
          this.notifyService.error('Failed to register. Please try again.');
          return throwError(() => error);
        })
      ).subscribe((response) => {
        console.log('register response', response);
        if (response.requiresAuthentication) {
          this.openSignIn();
          return;
        }
        if (response.success) {
          // TODO: we need a way to dynamically determine the next quiz ID based on the user's progress, or
          // some GUID that we can specify whereby a user is clicking on a link and going to the url with a parameter having this ID ?
          this.router.navigate(['/quiz', '1'], { queryParams: { title: 'Quiz 1' } });
        }
        this.loading.set(false);
      });
    }
  }

  openSignIn(): void {
    const email = this.quizForm.get('email')?.value?.trim();

    this.dialogService.openGeneralLoginDialog(
      '/quiz/start',
      'Sign in to continue with your survey.',
      email
    ).subscribe();
  }
}
