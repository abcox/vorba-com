import { CommonModule } from "@angular/common";
import { Component, effect, inject, input, signal } from "@angular/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { PeopleService } from "@file-service-api/v1/api/api";
import { tap, catchError, of } from "rxjs";
import { ContactGroupMember } from "../google-contact-group-list/google-contact-group-list.component";
import { GoogleContactGroupMemberListComponent } from "../google-contact-group-member-list/google-contact-group-member-list.component";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";

@Component({
    standalone: true,
    imports: [CommonModule, GoogleContactGroupMemberListComponent,
        MatChipsModule,
        MatExpansionModule, MatIconModule],
    selector: 'app-google-contact-group-list-item',
    templateUrl: './google-contact-group-list-item.component.html',
    styleUrls: ['./google-contact-group-list-item.component.scss']
})
export class GoogleContactGroupListItemComponent {
    peopleService = inject(PeopleService);
    groupInput = input<any>(null);
    groupMembersMap = signal<{ [groupId: string]: ContactGroupMember[] }>({});
    expanded = signal(false);

    constructor() {
        effect(() => {
            const group = this.groupInput();
            const expanded = this.expanded();
            if (!expanded) return;
            if (this.hasMembers) return;
            this.getGroupMembers(group?.resourceName);
        });
    }

    get hasMembers(): boolean {
        const group = this.groupInput();
        if (!group) return false;
        const members = this.groupMembersMap()[group.resourceName];
        return Array.isArray(members) && members.length > 0;
    }

    get memberCount(): number {
        const group = this.groupInput();
        if (!group) return 0;
        const members = this.groupMembersMap()[group.resourceName];
        // Use fetched members count if available, otherwise fall back to input's memberCount
        return Array.isArray(members) ? members.length : (group.memberCount ?? 0);
    }

    refreshMembers() {
        const group = this.groupInput();
        if (!group) return;
        this.getGroupMembers(group.resourceName);
    }
    
    getGroupMembers(resourceName?: string) {
        if (!resourceName) return;
        const resourceNameId = resourceName.split('/').pop() || '';
        this.peopleService.peopleControllerGetContactGroupMembers(resourceNameId).pipe(
            tap((response: ContactGroupMember[]) => {
                console.log(`Contacts in group ${resourceName}:`, response);
                this.groupMembersMap.update(map => ({ ...map, [resourceName]: response }));
            }),
            catchError(err => {
                console.error(`Error fetching contacts for group ${resourceName}:`, err);
                return of(null);
            })
        ).subscribe();
    }
}
