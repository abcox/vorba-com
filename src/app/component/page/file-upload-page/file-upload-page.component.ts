import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FileUploadComponent } from './_component/file-upload/file-upload.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { FileService as FileApiService } from '@file-service-api/v1';
import { ActivatedRoute, Router } from '@angular/router';

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
    private fileService = inject(FileApiService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    private _selectedFiles: File[] = [];

    quizId: string | null = null;
    uploadForm: FormGroup = this.fb.group({
        files: [[] as File[]]
    });

    constructor() {
        console.log('FileUploadPageComponent initialized');
        console.log('Current URL:', window.location.href);
        console.log('Current pathname:', window.location.pathname);

        this.route.params.subscribe(params => {
            this.quizId = params['id'];
        });
    }

    get selectedFiles() {
        this._selectedFiles = this.uploadForm.get('files')?.value ?? [];
        return this._selectedFiles;
    }

    set selectedFiles(files: File[]) {
        this._selectedFiles = files;
        this.uploadForm.patchValue({ files });
    }

    updateSelectedFiles(files: File[]) {
        //console.log('Files selected:', files);
        //this.uploadForm.patchValue({ files });
        this.selectedFiles = files;
    }

    uploadFiles(files: File[]) {
        console.log('Uploading files:', files);
        // TODO: use /api/v1/user/file/upload, and
        // upload multiple files..
        // for multi-file upload, we could have an array of observables
        // where we are responsing to the response by setting a status
        // on the file view model so that files can be shown in progress
        // and then have them show when they've been uploaded (remove the 'X')
        this.fileService.fileControllerUploadFile(files[0]).subscribe({
            next: (response) => {
                console.log('fileControllerUploadFile response:', response);
                if (response.size > 0) { // TODO: create 'success' flag at api
                    this.selectedFiles = [];
                    //this.router.navigate(['/quiz', this.quizId, 'end']);
                }
            },
            error: (error) => {
                console.error('fileControllerUploadFile error:', error);
            }
        });
    }
}