import { Component } from "@angular/core";
import { GoogleContactGroupListComponent } from "./_component/people/google-contact-group-list/google-contact-group-list.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { GoogleCalendarViewComponent } from "./_component/calendar/google-calendar-view/google-calendar-view.component";

@Component({
    standalone: true,
    imports: [
        GoogleCalendarViewComponent,
        GoogleContactGroupListComponent,
        MatExpansionModule,
    ],
    selector: 'app-google-page',
    templateUrl: './google-page.component.html',
    styleUrls: ['./google-page.component.scss']
})
export class GooglePageComponent {
}