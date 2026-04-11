import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { ContactService } from '@file-service-api/v1';
import { Subscription, interval } from 'rxjs';
import { ConfirmDialogService } from '@src/app/component/dialog/confirm-dialog';

interface ContactListRow {
  _id?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  status?: string;
  isActive?: boolean;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  emails?: Array<{
    address?: string;
    isPrimary?: boolean;
  }>;
}

interface ContactListPayload {
  data?: ContactListRow[];
  contacts?: ContactListRow[];
  total?: number;
  page?: number;
  limit?: number;
}

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTableModule,
    RouterModule
  ],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss'
})
export class ContactListComponent implements OnInit, OnDestroy {
  private contactService = inject(ContactService);
  private router = inject(Router);
  private confirmDialog = inject(ConfirmDialogService);

  displayedColumns: string[] = ['name', 'email', 'status', 'source', 'createdAt', 'actions'];
  contacts: ContactListRow[] = [];
  total = 0;
  isLoading = false;
  autoRefreshEnabled = false;
  autoRefreshSeconds = 15;
  private refreshSub?: Subscription;

  ngOnInit(): void {
    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  loadContacts(): void {
    this.isLoading = true;

    this.contactService.contactControllerGetContactList('1', '100').subscribe({
      next: (response) => {
        const payload = (response.data ?? {}) as ContactListPayload;
        const rawList = Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.contacts)
            ? payload.contacts
            : [];

        this.contacts = [...rawList].sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });

        this.total = Number(payload.total ?? this.contacts.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.isLoading = false;
      }
    });
  }

  toggleAutoRefresh(enabled: boolean): void {
    this.autoRefreshEnabled = enabled;

    if (!enabled) {
      this.stopAutoRefresh();
      return;
    }

    this.stopAutoRefresh();
    this.refreshSub = interval(this.autoRefreshSeconds * 1000).subscribe(() => {
      this.loadContacts();
    });
  }

  viewContact(contact: ContactListRow): void {
    const id = contact._id;
    if (!id) {
      return;
    }

    this.router.navigate(['/admin/contact', id]);
  }

  deleteContact(contact: ContactListRow): void {
    const id = contact._id;
    if (!id) {
      return;
    }

    const displayName = this.getDisplayName(contact);
    this.confirmDialog.confirmDelete(displayName).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.contactService.contactControllerDeleteContact(id).subscribe({
        next: () => {
          this.contacts = this.contacts.filter((c) => c._id !== id);
          this.total = Math.max(0, this.total - 1);
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
        }
      });
    });
  }

  getDisplayName(contact: ContactListRow): string {
    const fullName = `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();
    return fullName || contact.company || 'Unknown';
  }

  getPrimaryEmail(contact: ContactListRow): string {
    const primary = contact.emails?.find((email) => email.isPrimary)?.address;
    if (primary) {
      return primary;
    }

    return contact.emails?.[0]?.address ?? 'N/A';
  }

  private stopAutoRefresh(): void {
    this.refreshSub?.unsubscribe();
    this.refreshSub = undefined;
  }
}
