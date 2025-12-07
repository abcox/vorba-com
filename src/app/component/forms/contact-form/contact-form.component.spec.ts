import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { ContactFormComponent } from './contact-form.component';

describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContactFormComponent, 
        BrowserAnimationsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.formGroup.get('firstName')?.value).toBe('');
    expect(component.formGroup.get('lastName')?.value).toBe('');
    expect(component.formGroup.get('email')?.value).toBe('');
    expect(component.formGroup.get('company')?.value).toBe('');
    expect(component.formGroup.get('projectDetails')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const formControls = component.formGroup.controls;
    
    expect(formControls['firstName'].hasError('required')).toBeTruthy();
    expect(formControls['lastName'].hasError('required')).toBeTruthy();
    expect(formControls['email'].hasError('required')).toBeTruthy();
    expect(formControls['company'].hasError('required')).toBeTruthy();
    expect(formControls['projectDetails'].hasError('required')).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.formGroup.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
    
    emailControl?.setValue('test@example.com');
    expect(emailControl?.hasError('email')).toBeFalsy();
  });

  it('should validate minimum length for text fields', () => {
    const firstNameControl = component.formGroup.get('firstName');
    const projectDetailsControl = component.formGroup.get('projectDetails');
    
    firstNameControl?.setValue('A');
    expect(firstNameControl?.hasError('minlength')).toBeTruthy();
    
    projectDetailsControl?.setValue('Short');
    expect(projectDetailsControl?.hasError('minlength')).toBeTruthy();
    
    firstNameControl?.setValue('John');
    expect(firstNameControl?.hasError('minlength')).toBeFalsy();
    
    projectDetailsControl?.setValue('This is a longer project description');
    expect(projectDetailsControl?.hasError('minlength')).toBeFalsy();
  });

  it('should return correct error messages', () => {
    expect(component.getErrorMessage('firstName')).toContain('First Name is required');
    
    const emailControl = component.formGroup.get('email');
    emailControl?.setValue('invalid');
    emailControl?.markAsTouched();
    expect(component.getErrorMessage('email')).toContain('valid email address');
  });

  it('should check hasError correctly', () => {
    const firstNameControl = component.formGroup.get('firstName');
    
    expect(component.hasError('firstName')).toBeFalsy(); // Not touched yet
    
    firstNameControl?.markAsTouched();
    expect(component.hasError('firstName')).toBeTruthy(); // Invalid and touched
    
    firstNameControl?.setValue('John');
    expect(component.hasError('firstName')).toBeFalsy(); // Valid now
  });

  it('should handle form submission with valid data', () => {
    // Fill out the form with valid data
    component.formGroup.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Test Company',
      projectDetails: 'This is a test project description with sufficient length'
    });

    spyOn(console, 'log');
    
    //component.submit(); // todo: provide formDirective
    
    expect(component.vm().isSubmitting).toBeTruthy();
    expect(console.log).toHaveBeenCalledWith('Contact form submission:', jasmine.any(Object));
  });

  it('should mark all fields as touched when submitting invalid form', () => {
    spyOn(component.formGroup.get('firstName')!, 'markAsTouched');
    spyOn(component.formGroup.get('lastName')!, 'markAsTouched');
    
    //component.submit(); // Submit with empty form
    
    expect(component.formGroup.get('firstName')?.markAsTouched).toHaveBeenCalled();
    expect(component.formGroup.get('lastName')?.markAsTouched).toHaveBeenCalled();
  });
});