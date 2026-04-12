import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ContactEmailDto,
  ContactPhoneDto,
  ContactService,
  CreateContactDto,
  UpdateContactDto,
} from '@file-service-api/v1';

interface ContactData {
  firstName?: string;
  lastName?: string;
  company?: string;
  status?: string;
  source?: string;
  title?: string;
  department?: string;
  notes?: string;
  emails?: Array<{ address?: string; isPrimary?: boolean }>;
  phones?: Array<{ number?: string; isPrimary?: boolean }>;
}

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    RouterModule,
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);

  mode: 'create' | 'edit' = 'create';
  contactId: string | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  private readonly newContactStatus = 'active';
  private readonly newContactSource = 'admin';
  readonly statusOptions: ReadonlyArray<SelectOption> = [
    { value: 'active', label: 'Active' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'closed', label: 'Closed' },
  ];
  readonly sourceOptions: ReadonlyArray<SelectOption> = [
    { value: 'admin', label: 'Admin' },
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'import', label: 'Import' },
    { value: 'manual', label: 'Manual' },
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.maxLength(100)]],
    lastName: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.email, Validators.maxLength(200)]],
    phone: ['', [Validators.maxLength(50)]],
    company: ['', [Validators.maxLength(150)]],
    status: ['', [Validators.maxLength(100)]],
    source: ['', [Validators.maxLength(100)]],
    title: ['', [Validators.maxLength(120)]],
    department: ['', [Validators.maxLength(120)]],
    notes: ['', [Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.contactId = this.route.snapshot.paramMap.get('id');
    this.mode = this.contactId ? 'edit' : 'create';

    if (this.mode === 'create') {
      this.applyNewContactDefaults();
    }

    if (this.mode === 'edit' && this.contactId) {
      this.form.controls.status.enable({ emitEvent: false });
      this.form.controls.source.enable({ emitEvent: false });
      this.loadContact(this.contactId);
    }
  }

  get pageTitle(): string {
    return this.mode === 'edit' ? 'Edit Contact' : 'New Contact';
  }

  cancel(): void {
    this.router.navigate(['/admin/contact']);
  }

  clearForm(): void {
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      status: this.mode === 'create' ? this.newContactStatus : '',
      source: this.mode === 'create' ? this.newContactSource : '',
      title: '',
      department: '',
      notes: '',
    });

    if (this.mode === 'create') {
      this.form.controls.status.disable({ emitEvent: false });
      this.form.controls.source.disable({ emitEvent: false });
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.errorMessage = '';
  }

  submit(): void {
    if (this.isSaving) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSaving = true;

    const request$ =
      this.mode === 'edit' && this.contactId
        ? this.contactService.contactControllerUpdateContact(this.contactId, this.buildUpdatePayload())
        : this.contactService.contactControllerCreateContact(this.buildCreatePayload());

    request$.subscribe({
      next: (response) => {
        const createdOrUpdatedId = this.extractContactId(response.data);
        const targetId = createdOrUpdatedId ?? this.contactId;
        this.isSaving = false;

        if (targetId) {
          this.router.navigate(['/admin/contact', targetId]);
          return;
        }

        this.router.navigate(['/admin/contact']);
      },
      error: (error) => {
        this.errorMessage =
          typeof error?.error?.message === 'string' ? error.error.message : 'Unable to save contact';
        this.isSaving = false;
      },
    });
  }

  private loadContact(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.contactService.contactControllerGetContactById(id).subscribe({
      next: (response) => {
        const data = response.data as ContactData | undefined;
        if (data) {
          const primaryEmail =
            data.emails?.find((e) => e.isPrimary)?.address ?? data.emails?.[0]?.address ?? '';
          const primaryPhone =
            data.phones?.find((p) => p.isPrimary)?.number ?? data.phones?.[0]?.number ?? '';

          this.form.patchValue({
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            email: primaryEmail,
            phone: primaryPhone,
            company: data.company ?? '',
            status: this.resolveOptionValue(data.status, this.statusOptions) ?? '',
            source: this.resolveOptionValue(data.source, this.sourceOptions) ?? '',
            title: data.title ?? '',
            department: data.department ?? '',
            notes: data.notes ?? '',
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          typeof error?.error?.message === 'string'
            ? error.error.message
            : 'Unable to load contact details';
        this.isLoading = false;
      },
    });
  }

  private buildCreatePayload(): CreateContactDto {
    const value = this.form.getRawValue();
    const firstName = this.normalize(value.firstName);
    const lastName = this.normalize(value.lastName);

    return {
      name: this.buildDisplayName(firstName, lastName, value.company, value.email),
      firstName,
      lastName,
      emails: this.buildEmailPayload(value.email),
      phones: this.buildPhonePayload(value.phone),
      addresses: [],
      company: this.normalize(value.company),
      title: this.normalize(value.title),
      department: this.normalize(value.department),
      status: this.newContactStatus,
      source: this.newContactSource,
      tags: [],
      socialMedia: [],
      notes: this.normalize(value.notes),
      isActive: true,
    };
  }

  private buildUpdatePayload(): UpdateContactDto {
    const value = this.form.getRawValue();
    const firstName = this.normalize(value.firstName);
    const lastName = this.normalize(value.lastName);

    return {
      name: this.buildDisplayName(firstName, lastName, value.company, value.email),
      firstName,
      lastName,
      emails: this.buildEmailPayload(value.email),
      phones: this.buildPhonePayload(value.phone),
      company: this.normalize(value.company),
      title: this.normalize(value.title),
      department: this.normalize(value.department),
      status: this.resolveOptionValue(value.status, this.statusOptions) ?? this.normalize(value.status),
      source: this.resolveOptionValue(value.source, this.sourceOptions) ?? this.normalize(value.source),
      notes: this.normalize(value.notes),
    };
  }

  private buildEmailPayload(emailValue: string): ContactEmailDto[] {
    const email = this.normalize(emailValue);
    if (!email) {
      return [];
    }

    return [{ address: email, type: ContactEmailDto.TypeEnum.Work, isPrimary: true }];
  }

  private buildPhonePayload(phoneValue: string): ContactPhoneDto[] {
    const phone = this.normalize(phoneValue);
    if (!phone) {
      return [];
    }

    return [{ number: phone, type: ContactPhoneDto.TypeEnum.Mobile, isPrimary: true }];
  }

  private buildDisplayName(
    firstName?: string,
    lastName?: string,
    companyValue?: string,
    emailValue?: string,
  ): string {
    const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
    const company = this.normalize(companyValue);
    const email = this.normalize(emailValue);

    return fullName || company || email || 'New Contact';
  }

  private normalize(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private resolveOptionValue(value: string | undefined, options: ReadonlyArray<SelectOption>): string | undefined {
    const normalized = this.normalize(value)?.toLowerCase();
    if (!normalized) {
      return undefined;
    }

    const matchByValue = options.find((option) => option.value.toLowerCase() === normalized);
    if (matchByValue) {
      return matchByValue.value;
    }

    const matchByLabel = options.find((option) => option.label.toLowerCase() === normalized);
    return matchByLabel?.value;
  }

  private extractContactId(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    const candidate = data as { _id?: unknown; id?: unknown };
    if (typeof candidate._id === 'string' && candidate._id) {
      return candidate._id;
    }
    if (typeof candidate.id === 'string' && candidate.id) {
      return candidate.id;
    }

    return undefined;
  }

  private applyNewContactDefaults(): void {
    this.form.patchValue(
      {
        status: this.newContactStatus,
        source: this.newContactSource,
      },
      { emitEvent: false },
    );
    this.form.controls.status.disable({ emitEvent: false });
    this.form.controls.source.disable({ emitEvent: false });
  }
}
