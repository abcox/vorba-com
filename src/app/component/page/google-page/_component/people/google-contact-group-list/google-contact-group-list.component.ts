import { group } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatIconModule } from "@angular/material/icon";
import { PeopleService } from "@file-service-api/v1";
import { catchError, of, tap } from "rxjs";
import { MatExpansionModule } from "@angular/material/expansion";
import { GoogleContactGroupListItemComponent } from "../google-contact-group-list-item/google-contact-group-list-item.component";

export interface ContactGroupMember {
    resourceName: string;
    names?: { displayName: string }[];
}

@Component({
    standalone: true,
    imports: [CommonModule, MatIconModule, MatExpansionModule, GoogleContactGroupListItemComponent],
    selector: 'app-google-people-list-view',
    templateUrl: './google-contact-group-list.component.html',
    styleUrls: ['./google-contact-group-list.component.scss']
})
export class GoogleContactGroupListComponent {
    peopleService = inject(PeopleService);
    
    groupList$ = this.peopleService.peopleControllerGetContactGroups().pipe(
        tap(response => console.log('Contact Groups response:', response)),
        catchError(err => {
            console.error('Error fetching contact groups:', err);
            return of(null);
        })
    );
    groupList = toSignal(this.groupList$);
    
    constructor() {
        effect(() => {
            const groups = this.groupList();
            console.log('Groups signal updated:', groups);
        });
    }
}
