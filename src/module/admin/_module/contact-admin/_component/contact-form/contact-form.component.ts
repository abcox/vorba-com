import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContactService } from '@file-service-api/v1';

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

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
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
  errorMessage = '';

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

    if (this.mode === 'edit' && this.contactId) {
      this.loadContact(this.contactId);
    }
  }

  get pageTitle(): string {
    return this.mode === 'edit' ? 'Edit Contact' : 'New Contact';
  }

  cancel(): void {
    this.router.navigate(['/admin/contact']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Implementation intentionally deferred until routes/API flow are wired.
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
            status: data.status ?? '',
            source: data.source ?? '',
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
}
