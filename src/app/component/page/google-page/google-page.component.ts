import { Component } from "@angular/core";
import { GoogleContactGroupListComponent } from "./_component/people/google-contact-group-list/google-contact-group-list.component";

@Component({
    standalone: true,
    imports: [GoogleContactGroupListComponent],
    selector: 'app-google-page',
    templateUrl: './google-page.component.html',
    styleUrls: ['./google-page.component.scss']
})
export class GooglePageComponent {
}