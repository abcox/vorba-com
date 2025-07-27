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
import { AuthService } from 'src/app/service/auth/auth.service';
import { environment } from 'src/environments/environment';
import { UserRegistrationRequest } from '../../../../../file-service-api/v1';

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
  private authService = inject(AuthService);
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

      const request: UserRegistrationRequest = {
        email: this.quizForm.value.email,
        name: this.quizForm.value.name,
        password: this.quizForm.value.email,
        username: this.quizForm.value.email,
        //subscribeNewsletter: this.quizForm.value.subscribeNewsletter,
        //termsAccepted: true
      };

      this.authService.register(request).subscribe((success) => {
        console.log('register success', success);
        if (success) {
          // TODO: fix this by making "Quiz 1" in local cosmos db (emulator)
          if (environment.production) {
            this.router.navigate(['/quiz', '1'], { queryParams: { title: 'Quiz 1' } });
          } else {
            this.router.navigate(['/quiz', '2'], { queryParams: { title: 'Quiz 2' } });
          }
        }
      });
    }
  }
}
