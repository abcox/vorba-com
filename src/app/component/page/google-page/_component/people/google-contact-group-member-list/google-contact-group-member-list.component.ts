import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { GoogleContactGroupMemberListItemComponent } from "./_component/google-contact-group-member-list-item/google-contact-group-member-list-item.component";

@Component({
    standalone: true,
    imports: [CommonModule, MatExpansionModule, MatIconModule, GoogleContactGroupMemberListItemComponent],
    selector: 'app-google-contact-group-member-list',
    templateUrl: './google-contact-group-member-list.component.html',
    styleUrls: ['./google-contact-group-member-list.component.scss']
})
export class GoogleContactGroupMemberListComponent {
    groupMembers = input<any[]>([]);
}
