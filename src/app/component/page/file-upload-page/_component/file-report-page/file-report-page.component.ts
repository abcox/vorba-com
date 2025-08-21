import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    selector: 'app-file-report-page',
    standalone: true,
    imports: [
      CommonModule,
    ],
    template: `
    <div class="file-upload-container">
        <div class="top-left-container">
            <h1>Your report is ready!</h1>
            <h3>Points of focus:</h3>        
            <ul class="bullet-list">
                <li class="star">Key terms and obligations</li>
                <li class="star">Potential risks or red flags</li>
                <li class="star">Vague or unusual clauses</li>
                <li class="star">Alignment with standard practices</li>
                <li class="star">Suggested clarifications or alternatives</li>
                <li class="star">Sections worth legal review</li>
            </ul>
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
    .file-upload-container {
        display: flex;
        flex-direction: row;
        //gap: 2rem;
        width: 100%;
        min-height: calc(100vh - 4rem);
        padding: 2rem;
    }        
    .top-left-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        margin: 32px;
    }    
    .bullet-list {
        color: var(--primary-grayscale-50);
        list-style-type: none;
        padding: 0;
        margin: 1rem 0 0 2rem;
        
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
    }`
  })
  export class FileReportPageComponent {

  }