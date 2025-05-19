import { Component, inject } from '@angular/core';
import { LayoutService } from '../../layout/_service/layout.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss'
})
export class ContactPageComponent {
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
      // TODO: Implement email sending logic
    }
  }
}
