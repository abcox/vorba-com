import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-resume',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatMenuModule, MatIconModule],
    templateUrl: './resume.component.html',
    styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    onIframeLoad() {
        console.log('Iframe loaded');
    }

    downloadResume(format: 'html' | 'pdf') {
        if (format === 'pdf') {
            const iframe = document.querySelector('iframe');
            if (iframe) {
                console.log('Opening print dialog...');
                if (iframe.contentWindow) {
                    iframe.contentWindow.print();
                } else {
                    window.print();
                }
            }
        } else {
            const link = document.createElement('a');
            link.href = '/assets/resume.html';
            link.download = 'AdamCox_Resume.html';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
} 