import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CalendarEvent } from 'angular-calendar';
import { MatIconModule } from '@angular/material/icon';
import { GoogleCalendarEventDto } from '../../../google-calendar-view/google-calendar-view.component';

export interface CalendarEventDialogData {
    action: string;
    event: CalendarEvent;
}

@Component({
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatDatepickerModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        FormsModule,
        JsonPipe
    ],
    providers: [provideNativeDateAdapter()],
    selector: 'app-calendar-event-dialog',
    styleUrls: ['./calendar-event-dialog.component.scss'],
    templateUrl: `./calendar-event-dialog.component.html`
})
export class CalendarEventDialogComponent {
    private dialogRef = inject(MatDialogRef<CalendarEventDialogComponent>);
    data = inject<CalendarEventDialogData>(MAT_DIALOG_DATA);
    
    // Title control
    title: string = this.data.event.title as string;
    
    // Form controls for dates
    startDate = new FormControl<Date>(new Date(this.data.event.start));
    endDate = new FormControl<Date | null>(this.data.event.end ? new Date(this.data.event.end) : new Date(this.data.event.start));
    
    // Time controls
    allDay: boolean;
    startTime: string;
    endTime: string;

    constructor() {
        const startDt = new Date(this.data.event.start);
        const endDt = this.data.event.end ? new Date(this.data.event.end) : startDt;
        
        // Detect if all-day event (both times at midnight)
        this.allDay = this.data.event.allDay || (this.isMidnight(startDt) && this.isMidnight(endDt));
        
        // Format times as HH:mm for input[type="time"]
        this.startTime = this.formatTime(startDt);
        this.endTime = this.formatTime(endDt);
    }

    private isMidnight(date: Date): boolean {
        return date.getHours() === 0 && date.getMinutes() === 0;
    }

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    private parseTime(timeStr: string): { hours: number; minutes: number } {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return { hours: hours || 0, minutes: minutes || 0 };
    }
    
    openEventInGoogleCalendar(): void {
        const googleEvent = this.data.event.meta as GoogleCalendarEventDto;
        const htmlLink = googleEvent.htmlLink;
        if (htmlLink) {
            window.open(htmlLink, '_blank');
        }
    }

    save(): void {
        const start = this.startDate.value ? new Date(this.startDate.value) : new Date();
        const end = this.endDate.value ? new Date(this.endDate.value) : new Date(start);
        
        if (this.allDay) {
            // Set to midnight for all-day events
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
        } else {
            // Apply selected times
            const startTimeParsed = this.parseTime(this.startTime);
            const endTimeParsed = this.parseTime(this.endTime);
            
            start.setHours(startTimeParsed.hours, startTimeParsed.minutes, 0, 0);
            end.setHours(endTimeParsed.hours, endTimeParsed.minutes, 0, 0);
        }
        
        this.dialogRef.close({
            ...this.data.event,
            title: this.title,
            start,
            end,
            allDay: this.allDay
        });
    }
}
