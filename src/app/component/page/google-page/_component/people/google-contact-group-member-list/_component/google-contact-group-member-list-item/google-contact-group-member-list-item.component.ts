import { CommonModule } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { GoogleContactGroupMemberListItemDetailComponent } from "../google-contact-group-member-list-item-detail/google-contact-group-member-list-item-detail.component";
import { RouterLink } from "@angular/router";
import { Router } from "@angular/router";

@Component({
    standalone: true,
    imports: [CommonModule, MatExpansionModule, MatIconModule, GoogleContactGroupMemberListItemDetailComponent, RouterLink],
    selector: 'app-google-contact-group-member-list-item',
    templateUrl: './google-contact-group-member-list-item.component.html',
    styleUrls: ['./google-contact-group-member-list-item.component.scss']
})
export class GoogleContactGroupMemberListItemComponent {
    router = inject(Router);
    memberInput = input<any>(null);

    constructor() {}

    //#region Example data structure for a contact member
    /*
    {
        "resourceName": "people/c8354119414991994057",
        "etag": "%EgcBAgkuNz0+GgQBAgUHIgwyVmRJQ2tqRzNvOD0=",
        "names": [
            {
            "metadata": {
                "primary": true,
                "source": {
                "type": "CONTACT",
                "id": "73efcb588dcabcc9"
                },
                "sourcePrimary": true
            },
            "displayName": "Adam Cox",
            "familyName": "Cox",
            "givenName": "Adam",
            "displayNameLastFirst": "Cox, Adam",
            "unstructuredName": "Adam Cox"
            },
            {
            "metadata": {
                "source": {
                "type": "PROFILE",
                "id": "109178119628813002442"
                },
                "sourcePrimary": true
            },
            "displayName": "Adam Cox",
            "familyName": "Cox",
            "givenName": "Adam",
            "displayNameLastFirst": "Cox, Adam",
            "unstructuredName": "Adam Cox"
            }
        ],
        "emailAddresses": [
            {
            "metadata": {
                "primary": true,
                "source": {
                "type": "CONTACT",
                "id": "73efcb588dcabcc9"
                },
                "sourcePrimary": true
            },
            "value": "adam@adamcox.net",
            "displayName": "adam@adamcox.net"
            },
            {
            "metadata": {
                "source": {
                "type": "CONTACT",
                "id": "73efcb588dcabcc9"
                }
            },
            "value": "admin@adamcox.net",
            "displayName": "admin@adamcox.net"
            },
            {
            "metadata": {
                "source": {
                "type": "CONTACT",
                "id": "73efcb588dcabcc9"
                }
            },
            "value": "adam@dariancox.com",
            "displayName": "adam@dariancox.com"
            },
            {
            "metadata": {
                "source": {
                "type": "CONTACT",
                "id": "73efcb588dcabcc9"
                }
            },
            "value": "admin@dariancox.com"
            },
            {
            "metadata": {
                "source": {
                "type": "CONTACT",
                "id": "73efcb588dcabcc9"
                }
            },
            "value": "adam@vidapure.ca"
            },
            {
            "metadata": {
                "source": {
                "type": "CONTACT",
                "id": "73efcb588dcabcc9"
                }
            },
            "value": "admin@vidapure.ca"
            },
            {
            "metadata": {
                "verified": true,
                "source": {
                "type": "DOMAIN_PROFILE",
                "id": "109178119628813002442"
                },
                "sourcePrimary": true
            },
            "value": "adam@adamcox.net"
            },
            {
            "metadata": {
                "verified": true,
                "source": {
                "type": "DOMAIN_PROFILE",
                "id": "109178119628813002442"
                }
            },
            "value": "admin@adamcox.net"
            },
            {
            "metadata": {
                "verified": true,
                "source": {
                "type": "DOMAIN_PROFILE",
                "id": "109178119628813002442"
                }
            },
            "value": "adam@dariancox.com"
            },
            {
            "metadata": {
                "verified": true,
                "source": {
                "type": "DOMAIN_PROFILE",
                "id": "109178119628813002442"
                }
            },
            "value": "admin@dariancox.com"
            },
            {
            "metadata": {
                "verified": true,
                "source": {
                "type": "DOMAIN_PROFILE",
                "id": "109178119628813002442"
                }
            },
            "value": "adam@vidapure.ca"
            },
            {
            "metadata": {
                "verified": true,
                "source": {
                "type": "DOMAIN_PROFILE",
                "id": "109178119628813002442"
                }
            },
            "value": "admin@vidapure.ca"
            }
        ]
    }
    */
    //#endregion // Example data structure for a contact member

    navigateToMember(): void {
        const resourceName = this.memberInput()?.resourceName;
        if (resourceName) {
            const memberId = resourceName.split('/')[1];
            // Assuming there's a route set up for viewing contact details
            // e.g., /contacts/:id
            // You would typically use a router service to navigate
            console.log(`Navigating to contact detail page for ID: ${memberId}`);
            window.open(`https://contacts.google.com/person/${memberId}`, '_blank');
        }
    }

    get displayName(): string {
        return this.memberInput()?.names?.[0]?.displayName || 'Unnamed Contact';
    }

    get primaryEmailAddress(): string | null {
        const emails = this.memberInput()?.emailAddresses || [];
        const primaryEmailObj = emails.find((emailObj: any) => emailObj.metadata?.primary);
        return primaryEmailObj ? primaryEmailObj.value : null;
    }
}
