import {Component, EventEmitter, inject, input, Output, signal, computed} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import { ContactService } from '@file-service-api/v1/api/api';
import { ContactEmailDto, CreateContactDto } from '@file-service-api/v1';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  projectDetails: string;
}

interface ViewModel {
  title: string;
  subtitle: string;
  isSubmitting: boolean;
  submitButtonText: string;
}

export enum ContactFormPanelOrder {
  FormFirst = 'form-first',
  InfoFirst = 'info-first'
}

export interface ContactFormOptions {
  panelOrder: ContactFormPanelOrder;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  data: ContactFormData;
}

const DEFAULT_CONTACT_FORM_OPTIONS: ContactFormOptions = {
  panelOrder: ContactFormPanelOrder.FormFirst
};

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private contactService = inject(ContactService);

  options = input<ContactFormOptions, Partial<ContactFormOptions>>(
    DEFAULT_CONTACT_FORM_OPTIONS, {
    transform: (value: Partial<ContactFormOptions>) => ({
      ...DEFAULT_CONTACT_FORM_OPTIONS,
      ...value
    })
  });
  
  @Output() formSubmitted = new EventEmitter<ContactFormResponse>();

  // Computed CSS classes based on panel order
  containerClasses = computed(() => {
    const order = this.options().panelOrder;
    return {
      'flex-row': order === ContactFormPanelOrder.InfoFirst,
      'flex-row-reverse': order === ContactFormPanelOrder.FormFirst
    };
  });

  infoPanelClasses = computed(() => ({
    'md:order-1': this.options().panelOrder === ContactFormPanelOrder.InfoFirst,
    'md:order-2': this.options().panelOrder === ContactFormPanelOrder.FormFirst
  }));

  formPanelClasses = computed(() => ({
    'md:order-2': this.options().panelOrder === ContactFormPanelOrder.InfoFirst,
    'md:order-1': this.options().panelOrder === ContactFormPanelOrder.FormFirst
  }));

  // Component state
  vm = signal<ViewModel>({
    title: 'Contact Us',
    subtitle: 'Let\'s discuss your project and how we can help bring your vision to life.',
    isSubmitting: false,
    submitButtonText: 'Send Message'
  });

  // Form setup
  formGroup: FormGroup = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    company: ['', [Validators.required]],
    projectDetails: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor() {
    // Set up form value changes subscription for real-time validation
    this.formGroup.valueChanges.subscribe(() => {
      // Optional: Add real-time form processing here
    });
  }

  /**
   * Submit the contact form
   */
  submit(formDirective: FormGroupDirective): void {
    if (this.formGroup.valid) {
      this.vm.update(current => ({
        ...current,
        isSubmitting: true,
        submitButtonText: 'Sending...'
      }));

      const formData: ContactFormData = this.formGroup.value;
      
      // TODO: Implement actual form submission logic
      console.log('Contact form submission:', formData);
      const contactDto: CreateContactDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emails: [{
          address: formData.email,
          type: ContactEmailDto.TypeEnum.Work,
          primary: true
        } as ContactEmailDto],
        // todo: review the following fields:
        company: formData.company,
        notes: formData.projectDetails,
        name: `${formData.firstName} ${formData.lastName}`,
        phones: [],
        addresses: [],
        status: 'new',
        source: 'website',
        tags: [],
        socialMedia: [],
        isActive: true,
      };
      this.contactService.contactControllerCreateContact(
        contactDto
      ).subscribe({
        next: (response) => {
          console.log('Contact form submitted successfully:', response);
          this.formSubmitted.emit({
            success: true,
            message: 'Form submitted successfully',
            data: formData
          });
        }
      });
      
      // Simulate API call
      setTimeout(() => {
        this.vm.update(current => ({
          ...current,
          isSubmitting: false,
          submitButtonText: 'Message Sent!'
        }));
        
        // Reset form after successful submission
        setTimeout(() => {
          formDirective.resetForm();
          this.vm.update(current => ({
            ...current,
            submitButtonText: 'Send Message'
          }));
        }, 2000);
      }, 1500);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.formGroup.controls).forEach(key => {
        this.formGroup.get(key)?.markAsTouched();
      });
    }
  }

  get firstName(): FormControl {
    return this.formGroup.get('firstName') as FormControl;
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.formGroup.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(controlName)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldDisplayName(controlName)} must be at least ${minLength} characters`;
    }
    return '';
  }

  /**
   * Get display name for form field
   */
  private getFieldDisplayName(controlName: string): string {
    const fieldNames: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      company: 'Company',
      projectDetails: 'Project Details'
    };
    return fieldNames[controlName] || controlName;
  }

  /**
   * Check if form control has error and is touched
   */
  hasError(controlName: string): boolean {
    const control = this.formGroup.get(controlName);
    return !!(control?.invalid && control?.touched);
  }
}