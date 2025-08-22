import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ExamplePdfViewerComponent } from "src/app/component/example-pdf-viewer/example-pdf-viewer.component";

@Component({
    selector: 'app-file-report-page',
    standalone: true,
    imports: [
      CommonModule,
      ExamplePdfViewerComponent
    ],
    template: `
    <div class="file-upload-container">
        <div class="top-left-container">
            <h1>Your report is ready!</h1>
            <div class="bullet-list-container">
                <div class="bullet-list-title">Points of focus:</div>        
                <ul class="bullet-list">
                    <li class="star">Key terms and obligations</li>
                    <li class="star">Potential risks or red flags</li>
                    <li class="star">Vague or unusual clauses</li>
                    <li class="star">Alignment with standard practices</li>
                    <li class="star">Suggested clarifications or alternatives</li>
                    <li class="star">Sections worth legal review</li>
                </ul>
            </div>
        </div>
        <div class="bottom-right-container">
            <app-example-pdf-viewer></app-example-pdf-viewer>
        </div>
    </div>`,
    styles: `
    :host {
        --sys-surface: var(--primary-grayscale-500);
        display: block;
        width: 100%;
        min-height: 100vh;
        background-color: var(--sys-surface);
    }
    h1, h3, p {
        color: var(--primary-grayscale-100);
        margin: 0 !important;
    }
    .bullet-list-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
        
        .bullet-list-title {
            font-size: 2rem;
            font-weight: 500;
            margin-bottom: 1rem;
            color: var(--primary-grayscale-100);
        }
    }
    .file-upload-container {
        display: flex;
        flex-direction: row;
        //gap: 2rem;
        width: 100%;
        min-height: calc(100vh - 4rem);
        padding: 2rem;
        
        @media (max-width: 960px) {
            flex-direction: column;
            padding: 0;
        }
    }
    .top-left-container {
        flex: 1;
        flex-direction: column;
        gap: 1rem;
        width: auto;
        margin: 2rem;
    }
    .bottom-right-container {
        flex: 2;
        width: auto;
        height: 100vh;
        margin: 2rem;
        padding: 0;

        @media (max-width: 960px) {
            margin: 0;
            padding: 0;
        }
    }
    .bullet-list {
        color: var(--primary-grayscale-50);
        list-style-type: none;
        padding: 0;
        margin-left: 1rem;
        
        li {
            position: relative;
            padding-left: 2rem;
            margin-bottom: 0.75rem;
            font-size: 1rem;
            color: var(--primary-grayscale-100);
            
            &::before {
                content: "●";
                position: absolute;
                left: 0;
                color: var(--primary-grayscale-50);
                font-size: 1.25rem;
            }
        }
    }
    `
  })
  export class FileReportPageComponent {

  }