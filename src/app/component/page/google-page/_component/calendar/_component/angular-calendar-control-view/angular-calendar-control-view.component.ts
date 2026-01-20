import { Component, computed, effect, inject, input, output, signal } from "@angular/core";
import { JsonPipe } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { 
    CalendarEvent, 
    CalendarModule, 
    CalendarView, 
    DateAdapter, 
    CalendarUtils, 
    CalendarA11y, 
    CalendarDateFormatter,
    CalendarEventTitleFormatter,
    CalendarEventAction
} from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { A11yModule } from "@angular/cdk/a11y";
import { GoogleCalendarEventDto } from "../../google-calendar-view/google-calendar-view.component";
import { isSameDay, isSameMonth } from "date-fns";
import { CalendarEventDialogComponent } from "./calendar-event-dialog/calendar-event-dialog.component";
import { Subject } from "rxjs";

@Component({
    standalone: true,
    imports: [
        CalendarModule,
        JsonPipe,
        MatButtonModule,
        MatExpansionModule,
        MatDialogModule,
        MatIconModule,
        MatTooltipModule,
        A11yModule
    ],
    selector: 'app-angular-calendar-control-view',
    templateUrl: `./angular-calendar-control-view.component.html`,
    styleUrls: ['./angular-calendar-control-view.component.scss'],
    providers: [
        {
            provide: DateAdapter,
            useFactory: adapterFactory
        },
        CalendarUtils,
        CalendarA11y,
        CalendarDateFormatter,
        CalendarEventTitleFormatter
    ]
})
export class AngularCalendarControlViewComponent {
    private dialog = inject(MatDialog);

    resourceId = input<string>('');
    eventsInput = input<GoogleCalendarEventDto[]>([]);

    isDarkMode = input<() => boolean>(() => true); // todo: set from theme service

    // Output to request parent to refresh data
    refreshRequested = output<void>();

    //#region angular-calendar
    readonly CalendarView = CalendarView;
    viewDate = new Date();
    view: CalendarView = CalendarView.Month;

    // Writable signal to hold display events (allows local updates)
    displayEventsSignal = signal<CalendarEvent[]>([]);
    
    // Subject to trigger calendar refresh
    refresh$ = new Subject<void>();
    
    // Track if we've initialized from input
    private initialized = signal(false);
    
    // Loading state for refresh
    isRefreshing = signal(false);
    
    // Track refresh start time for minimum animation duration
    private refreshStartTime = 0;
    private readonly MIN_REFRESH_DURATION = 800; // ms

    constructor() {
        // Sync input events to the display signal ONLY on first load
        effect(() => {
            const inputEvents = this.eventsInput();
            // Only initialize once - don't overwrite local edits (unless refresh requested)
            if (!this.initialized()) {
                const transformed = this.transformEvents(inputEvents);
                if (transformed.length > 0) {
                    console.log('Initializing events from input:', transformed.length);
                    this.displayEventsSignal.set(transformed);
                    this.initialized.set(true);
                    
                    // Ensure minimum spin duration before hiding spinner
                    const elapsed = Date.now() - this.refreshStartTime;
                    const remaining = Math.max(0, this.MIN_REFRESH_DURATION - elapsed);
                    setTimeout(() => this.isRefreshing.set(false), remaining);
                }
            }
        }, { allowSignalWrites: true });

        effect(() => {
            console.log('isDarkMode', this.isDarkMode()());
        });
    }

    openGoogleCalendar(): void {
        const resourceId = this.resourceId();
        const htmlLink = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(resourceId)}`;
        window.open(htmlLink, '_blank');
    }

    // Request parent to refresh data from API
    refreshData(event: MouseEvent): void {
        event.stopPropagation(); // Prevent expansion panel toggle
        this.refreshStartTime = Date.now();
        this.isRefreshing.set(true);
        this.initialized.set(false); // Allow new data to be loaded
        
        // Emit refresh request - parent will call API
        this.refreshRequested.emit();
    }

    // Transform raw Google events to CalendarEvent format
    private transformEvents(inputEvents: any): CalendarEvent[] {
        const events = (inputEvents as any)?.items as GoogleCalendarEventDto[];
        if (!events || events.length === 0) {
            return [];
        }
        if (Array.isArray(events)) {
            return events.map((event: any) => {
                const isAllDay = !!event.start?.date;
                const startDate = isAllDay ? new Date(event.start?.date) : new Date(event.start?.dateTime);
                const endDate = event.end ? (isAllDay ? new Date(event.end?.date) : new Date(event.end?.dateTime)) : undefined;
                return {
                    id: event.id, // Add ID for tracking
                    start: startDate,
                    end: endDate,
                    title: event.summary || 'No Title',
                    color: {
                        primary: '#1e90ff',
                        secondary: '#3d3d3d' // provide highlighting of event date range
                    },
                    allDay: isAllDay,
                    meta: event,
                    actions: this.actions,
                } as CalendarEvent;
            });
        }
        return [];
    }

    // Getter for template binding
    get eventsForDisplay(): CalendarEvent[] {
        return this.displayEventsSignal();
    }

    /* get eventsForDisplay2(): CalendarEvent[] {
        const eventsTransform = this.eventsInput();
        if (Array.isArray(eventsTransform)) {
            return eventsTransform.map((event: any) => ({
                start: new Date(event.start?.dateTime || event.start?.date || new Date()),
                end: event.end ? new Date(event.end?.dateTime || event.end?.date || new Date()) : undefined,
                title: event.summary || 'No Title',
                color: {
                    primary: '#1e90ff',
                    secondary: '#D1E8FF'
                },
                allDay: event.start?.date ? true : false,
                meta: event
            }));
        }
        console.log('eventsTransform', eventsTransform);
        return eventsTransform;
    } */

    get actions(): CalendarEventAction[] {
        return [
            {
            label: '<i class="fas fa-fw fa-pencil-alt"></i>',
            a11yLabel: 'Edit',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                this.handleEvent('Edit', event);
            },
            },
            {
            label: '<i class="fas fa-fw fa-trash-alt"></i>',
            a11yLabel: 'Delete',
            onClick: ({ event }: { event: CalendarEvent }): void => {
                this.handleEvent('Delete', event);
            },
            },
        ] as CalendarEventAction[];
    }

    handleEvent(action: string, event: CalendarEvent): void {
        const dialogRef = this.dialog.open(CalendarEventDialogComponent, {
            width: '500px',            
            panelClass: 'calendar-event-dialog',            
            data: { action, event }
        });

        dialogRef.afterClosed().subscribe((result: CalendarEvent | undefined) => {
            if (result) {
                const eventId = event.id;
                
                // Simple update: map over events and replace the matching one
                this.displayEventsSignal.update(events => 
                    events.map(e => e.id === eventId ? { ...result, id: eventId, actions: this.actions } : e)
                );
                
                // Close day panel and trigger refresh
                this.activeDayIsOpen = false;
                this.refresh$.next();
            }
        });
    }

    setView(view: CalendarView) {
        this.view = view;
    }

    closeOpenMonthViewDay() {
        // No operation needed for this example
    }

    activeDayIsOpen: boolean = false;

    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
        console.log('dayClicked', date, events);
        if (isSameMonth(date, this.viewDate)) {
        if (
            (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
            events.length === 0
        ) {
            this.activeDayIsOpen = false;
        } else {
            this.activeDayIsOpen = true;
        }
        this.viewDate = date;
        }
    }


    //#endregion // angular-calendar
}
