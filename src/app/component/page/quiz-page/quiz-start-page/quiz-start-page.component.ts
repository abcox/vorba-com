import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

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
  styleUrl: './quiz-start-page.component.scss'
})
export class QuizStartPageComponent {
  quizForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.quizForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subscribeNewsletter: [false, [Validators.requiredTrue]]
      //termsAccepted: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit() {
    if (this.quizForm.valid) {
      console.log(this.quizForm.value);
      // Handle form submission
      // TODO: submit to API and get response having GUID
      // that we can user to anonymously track the quiz
      // and on successful response, route to quiz page      this.router.navigate(['/quiz', response.guid]);
      //this.router.navigate(['/quiz', response.guid]);

      this.router.navigate(['/quiz', '1234567890']);
    }
  }
}
