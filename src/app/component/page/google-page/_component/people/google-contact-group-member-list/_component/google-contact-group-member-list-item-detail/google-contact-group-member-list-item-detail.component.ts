import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";


@Component({
    standalone: true,
    imports: [CommonModule, MatIconModule],
    selector: 'app-google-contact-group-member-list-item-detail',
    templateUrl: './google-contact-group-member-list-item-detail.component.html',
    styleUrls: ['./google-contact-group-member-list-item-detail.component.scss']
})
export class GoogleContactGroupMemberListItemDetailComponent {
    memberInput = input<any>(null);
    constructor() {}
    get displayName(): string {
        return this.memberInput()?.names?.[0]?.displayName || 'Unnamed Contact';
    }
    get emailAddresses(): string[] {
        const emails = this.memberInput()?.emailAddresses || [];
        return emails.map((emailObj: any) => emailObj.value);
    }
    get primaryPhone(): string {
        const phones = this.memberInput()?.phoneNumbers || [];
        return phones.length > 0 ? phones[0].value : '(no primary phone)';   
    }
}