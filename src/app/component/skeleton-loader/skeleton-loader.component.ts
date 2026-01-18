import { CommonModule } from "@angular/common";
import { Component, effect, input } from "@angular/core";

export enum SkeletonLoaderStyle {
  Bars = 'form',
  Lines = 'list',
}
export interface SkeletonLoaderOptions {
    style?: SkeletonLoaderStyle;
    rowCount?: number;
    columnCount?: number;
}
export const defaults: SkeletonLoaderOptions = {
    style: SkeletonLoaderStyle.Lines,
    rowCount: 5,
    columnCount: 2
};

@Component({
    standalone: true,
    imports: [
        CommonModule
    ],
    selector: 'app-skeleton-loader',
    templateUrl: './skeleton-loader.component.html',
    styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent {
    options = input<SkeletonLoaderOptions>(defaults);
    skeletonStyle: SkeletonLoaderStyle = defaults.style || SkeletonLoaderStyle.Lines;
    rowCount: number = defaults.rowCount || 5;
    columnCount: number = defaults.columnCount || 2;
    rowArray: number[] = Array.from({ length: this.rowCount });
    columnArray: number[] = Array.from({ length: this.columnCount });

    constructor() {
        effect(() => {
            const opts = this.options();
            if (opts && opts.style) {
                this.skeletonStyle = opts.style;
                this.rowCount = opts.rowCount || defaults.rowCount || 5;
                this.columnCount = opts.columnCount || defaults.columnCount || 2;
                this.rowArray = Array.from({ length: this.rowCount });
                this.columnArray = Array.from({ length: this.columnCount });
            }
        });
    }
}
