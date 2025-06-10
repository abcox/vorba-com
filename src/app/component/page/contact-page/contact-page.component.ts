import { Component, inject } from '@angular/core';
import { LayoutService } from '../../layout/_service/layout.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailService } from '@backend-api/v1/api/email.service';
import { EmailServiceRequest } from '@backend-api/v1/model/emailServiceRequest';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss'
})
export class ContactPageComponent {
  private emailService = inject(EmailService);
  layoutService = inject(LayoutService);
  private fb = inject(FormBuilder);
  
  contactForm: FormGroup;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.layoutService.setTitlePrefix('Contact');
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
      const request: EmailServiceRequest = {
        recipientAddress: this.contactForm.value.email,
        subject: `Contact Form from ${this.contactForm.value.name}`,
        htmlContent: this.contactForm.value.message
      };
      this.emailService.sendEmail(request).subscribe(response => {
        console.log(response);
      });
    }
  }
}
