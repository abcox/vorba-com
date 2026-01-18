import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, effect, inject, input, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatExpansionModule } from "@angular/material/expansion";
import { CalendarService } from "@file-service-api/v1/api/api";
import { MatSelectModule } from "@angular/material/select";
import { MatChip } from "@angular/material/chips";
import { GoogleCalendarEventListComponent } from "../_component/google-calendar-event-list/google-calendar-event-list.component";
import { AngularCalendarControlViewComponent } from "../_component/angular-calendar-control-view/angular-calendar-control-view";
import { tap } from "rxjs";

@Component({
    standalone: true,
    imports: [
        AngularCalendarControlViewComponent,
        CommonModule, MatExpansionModule, MatSelectModule,
        MatChip, GoogleCalendarEventListComponent],
    selector: 'app-google-calendar-view',
    templateUrl: './google-calendar-view.component.html',
    styleUrls: ['./google-calendar-view.component.scss']
})
export class GoogleCalendarViewComponent implements AfterViewInit {
    calendarService = inject(CalendarService);
    calendarList$ = this.calendarService.calendarControllerGetCalendars().pipe(
        tap(() => this.loading.set(false))
    );
    calendarList = toSignal(this.calendarList$);

    calendarResourceIdInput = input<string>('');
    selectedCalendarResourceId = signal<string>('');
    calendarEvents = signal<any>(null);
    loadingEvents = signal(false);
    loading = signal(true); // Start as true since calendarList$ fetches immediately

    eventCount = signal<number>(0);
    initialized = signal(false);

    constructor() {
        // Initialize selectedCalendarResourceId from input (if provided)
        effect(() => {
            const inputId = this.calendarResourceIdInput();
            if (inputId) {
                this.selectedCalendarResourceId.set(inputId);
            }
        }, { allowSignalWrites: true });

        // Fetch events whenever selectedCalendarResourceId changes
        effect(() => {
            const resourceId = this.selectedCalendarResourceId();
            if (!resourceId) return;
            
            this.loadingEvents.set(true);
            this.calendarService.calendarControllerGetCalendarEventList(resourceId)
                .subscribe({
                    next: events => {
                        this.calendarEvents.set(events);
                        this.eventCount.set(events?.items?.length || 0);
                    },
                    complete: () => this.loadingEvents.set(false),
                    error: () => this.loadingEvents.set(false)
                });
        }, { allowSignalWrites: true });
    }

    ngAfterViewInit() {
        // Enable content after initial render to prevent flash
        setTimeout(() => {
            this.initialized.set(true);
        }, 0);
    }

    get disableExpansionPanel(): boolean {
        const calendars = this.calendarList();
        return !(calendars && Array.isArray(calendars.items) && calendars.items.length > 0);
    }

    get eventsForDisplay() {
        const events = this.calendarEvents();
        const sortedEvents = events?.items?.sort((a: any, b: any) => {
            // Handle both dateTime (timed events) and date (all-day events)
            const dateA = new Date(a.start?.dateTime || a.start?.date || 0).getTime();
            const dateB = new Date(b.start?.dateTime || b.start?.date || 0).getTime();
            return dateA - dateB;
        });
        return sortedEvents || [];
    }

    onCalendarSelectionChange(event: any) {
        const selectedResource = event.value;
        this.selectedCalendarResourceId.set(selectedResource);
    }
}