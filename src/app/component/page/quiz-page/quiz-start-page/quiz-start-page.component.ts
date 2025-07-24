import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Theme, ThemeService } from 'src/app/services/theme.service';
import { AuthService } from '@file-service-api/v1';

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
    MatCardModule
  ],
  templateUrl: './quiz-start-page.component.html',
  styleUrl: './quiz-start-page.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class QuizStartPageComponent {
  authService = inject(AuthService);
  quizForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.quizForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subscribeNewsletter: [false, [Validators.requiredTrue]]
      //termsAccepted: [false, [Validators.requiredTrue]]
    });
    
    // set theme to light
    this.themeService.setTheme(Theme.Light);
  }

  onSubmit() {
    if (this.quizForm.valid) {
      console.log('quizForm.value', this.quizForm.value);
      // Handle form submission
      // TODO: submit to API and get response having GUID
      // that we can user to anonymously track the quiz
      // and on successful response, route to quiz page      this.router.navigate(['/quiz', response.guid]);
      //this.router.navigate(['/quiz', response.guid]);

      const request: object = {
        email: this.quizForm.value.email,
        name: this.quizForm.value.name
      };

      this.authService.authControllerRegister(request).subscribe((response) => {
        console.log('authControllerRegister response', response);
        // TODO:
        // 1. manage the token by saving it in storage (local / session)
        // 2. navigate to the quiz page
        // 3. API: create /quiz/submit, so that we can persist the user's quiz input
        // 4. after, quiz submit, go to the file upload
        // 5. generate the report and deliver via response to file upload (perhaps we need an endpoint like /report/generate)
        // 6. provide user abilit to download the report
        // 7. schedule a follow up email to the user (thanks for taking our quiz -->  what did you think about your personalized report ?)
      });

      this.router.navigate(['/quiz', '1234567890']);
    }
  }
}
