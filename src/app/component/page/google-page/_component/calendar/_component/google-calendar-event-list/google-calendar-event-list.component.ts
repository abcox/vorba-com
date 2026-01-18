import { CommonModule } from "@angular/common";
import { Component, input } from "@angular/core";
import { MatChipsModule } from "@angular/material/chips";
import { MatExpansionModule } from "@angular/material/expansion";
import { SkeletonLoaderComponent, SkeletonLoaderOptions, SkeletonLoaderStyle } from "src/app/component/skeleton-loader/skeleton-loader.component";


@Component({
    standalone: true,
    imports: [
        CommonModule,
        MatChipsModule,
        MatExpansionModule,
        SkeletonLoaderComponent
    ],
    selector: 'app-google-calendar-event-list',
    templateUrl: './google-calendar-event-list.component.html',
    styleUrls: ['./google-calendar-event-list.component.scss']
})
export class GoogleCalendarEventListComponent {
    events = input<any>(null);
    loading = input<boolean>(false);
    resourceId = input<string>('');

    skeletonLoaderOptions = {
        style: SkeletonLoaderStyle.Lines,
        rowCount: 10,
        columnCount: 1
    } as SkeletonLoaderOptions;

    get eventCount(): number {
        const events = this.events();
        return events?.length || 0;
    }
}
