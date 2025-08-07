import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FileUploadComponent } from './_component/file-upload/file-upload.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-file-upload-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FileUploadComponent
  ],
  templateUrl: './file-upload-page.component.html',
  styleUrls: ['./file-upload-page.component.scss']
})
export class FileUploadPageComponent {
    private fb = inject(FormBuilder);
    uploadForm: FormGroup = this.fb.group({
        files: [[] as File[]]
    });

    constructor() {
        console.log('FileUploadPageComponent initialized');
        console.log('Current URL:', window.location.href);
        console.log('Current pathname:', window.location.pathname);
    }

    onFileSelected(files: File[]) {
        console.log('Files selected:', files);
        this.uploadForm.patchValue({ files });
    }
}