import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  items?: ContactListRow[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

type ContactSortField =
  | 'updatedAt'
  | 'createdAt'
  | 'nextFollowUpAt'
  | 'lastContactedAt'
  | 'name'
  | 'company';

type SortDirection = 'asc' | 'desc';
type ContactViewMode = 'table' | 'card';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  currentPage = 1;
  pageSize = 25;
  totalPages = 1;
  readonly pageSizeOptions: ReadonlyArray<number> = [10, 25, 50, 100];
  isLoading = false;
  autoRefreshEnabled = false;
  autoRefreshSeconds = 15;
  searchTerm = '';
  statusFilter = 'all';
  sortBy: ContactSortField = 'createdAt';
  sortDir: SortDirection = 'desc';
  viewMode: ContactViewMode = 'table';
  readonly sortOptions: ReadonlyArray<{ value: ContactSortField; label: string }> = [
    { value: 'createdAt', label: 'Created date' },
    { value: 'updatedAt', label: 'Updated date' },
    { value: 'name', label: 'Name' },
    { value: 'company', label: 'Company' },
    { value: 'lastContactedAt', label: 'Last contacted' },
    { value: 'nextFollowUpAt', label: 'Next follow-up' },
  ];
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

    const normalizedSearchTerm = this.searchTerm.trim();
    const status = this.statusFilter === 'all' ? undefined : this.statusFilter;

    this.contactService
      .contactControllerSearchContacts(
        normalizedSearchTerm || undefined,
        this.currentPage.toString(),
        this.pageSize.toString(),
        status,
        'true',
        this.sortBy,
        this.sortDir,
      )
      .subscribe({
      next: (response) => {
        const payload = (response.data ?? {}) as ContactListPayload;
        const rawList = Array.isArray(payload.items) ? payload.items : [];

        this.contacts = rawList;

        this.total = Number(payload.total ?? this.contacts.length);
        this.currentPage = Number(payload.page ?? this.currentPage);
        this.pageSize = Number(payload.limit ?? this.pageSize);
        this.totalPages = Number(
          payload.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize)),
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadContacts();
  }

  clearSearch(): void {
    if (!this.searchTerm) {
      return;
    }

    this.searchTerm = '';
    this.currentPage = 1;
    this.loadContacts();
  }

  goToPreviousPage(): void {
    if (this.currentPage <= 1 || this.isLoading) {
      return;
    }

    this.currentPage -= 1;
    this.loadContacts();
  }

  goToNextPage(): void {
    if (this.currentPage >= this.totalPages || this.isLoading) {
      return;
    }

    this.currentPage += 1;
    this.loadContacts();
  }

  onPageSizeChange(rawValue: string): void {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed === this.pageSize) {
      return;
    }

    this.pageSize = parsed;
    this.currentPage = 1;
    this.loadContacts();
  }

  getPageStart(): number {
    if (this.total === 0 || this.contacts.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getPageEnd(): number {
    if (this.total === 0 || this.contacts.length === 0) {
      return 0;
    }

    return Math.min(this.currentPage * this.pageSize, this.total);
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
