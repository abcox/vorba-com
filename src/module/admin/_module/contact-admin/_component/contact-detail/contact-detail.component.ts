import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContactService } from '@file-service-api/v1';

interface ContactDetail {
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  status?: string;
  source?: string;
  title?: string;
  department?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
  isActive?: boolean;
  emails?: Array<{ address?: string; isPrimary?: boolean }>;
  phones?: Array<{ number?: string; type?: string; isPrimary?: boolean }>;
}

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, RouterModule],
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss',
})
export class ContactDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contactService = inject(ContactService);

  contactId: string | null = null;
  contact?: ContactDetail;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.contactId = id;
    if (!id) {
      this.errorMessage = 'Missing contact id';
      return;
    }

    this.loadContact(id);
  }

  goBack(): void {
    this.router.navigate(['/admin/contact']);
  }

  getDisplayName(): string {
    if (!this.contact) {
      return 'Contact';
    }

    const fullName = `${this.contact.firstName ?? ''} ${this.contact.lastName ?? ''}`.trim();
    return fullName || this.contact.name || this.contact.company || 'Contact';
  }

  getPrimaryEmail(): string {
    const primary = this.contact?.emails?.find((email) => email.isPrimary)?.address;
    return primary || this.contact?.emails?.[0]?.address || 'N/A';
  }

  getPrimaryPhone(): string {
    const primary = this.contact?.phones?.find((phone) => phone.isPrimary)?.number;
    return primary || this.contact?.phones?.[0]?.number || 'N/A';
  }

  private loadContact(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.contactService.contactControllerGetContactById(id).subscribe({
      next: (response) => {
        this.contact = (response.data ?? undefined) as ContactDetail | undefined;
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
