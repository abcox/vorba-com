import { Component, input } from "@angular/core";

@Component({
    standalone: true,
    imports: [
    ],
    selector: 'app-angular-calendar-control-view',
    template: `<div>Angular Calendar Control View Component</div>`,
    styles: [``]
})
export class AngularCalendarControlViewComponent {
    events = input<any>([]);
}
