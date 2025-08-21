import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FileUploadComponent } from './_component/file-upload/file-upload.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService as UserApiService } from '@file-service-api/v1';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, finalize, of } from 'rxjs';

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
    FileUploadComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './file-upload-page.component.html',
  styleUrls: ['./file-upload-page.component.scss']
})
export class FileUploadPageComponent {
    private fb = inject(FormBuilder);
    private userService = inject(UserApiService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    private _selectedFiles: File[] = [];
    loading = signal(false);

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
        this.loading.set(true);
        // TODO: use /api/v1/user/file/upload, and
        // upload multiple files..
        // for multi-file upload, we could have an array of observables
        // where we are responsing to the response by setting a status
        // on the file view model so that files can be shown in progress
        // and then have them show when they've been uploaded (remove the 'X')
        
        // TODO:  fix issue from test where "Auth audience invalid"
        // path /api/file/upload
        // should be /api/user/file/upload (and use request.user.id)
        this.userService.userControllerUploadFile(files[0]).pipe(
            catchError((error) => {
                console.error('fileControllerUploadFile error:', error);
                return of(false);
            }),
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: (response) => {
                // TODO:  make userFileUploadResponse (dto) like:
                // {
                //     id: string;
                //     name: string;
                //     size: number;
                //     type: string;
                //     url: string;
                //     createdAt: string;
                //     updatedAt: string;
                //     success: boolean;
                //     message: string;  // could be "File already exists"
                // }
                // IF file already exists, provide re-use it and provide existing
                // >>> **** and then process custom report and provide download link...
                // ALSO... we need progress-type stuff for all API calls
                // because each time, user may wait even for a second...
                console.log('fileControllerUploadFile response:', response);
                const { fileInfo, fileUrl } = response;
                if (fileInfo && fileUrl) {
                    this.selectedFiles = [];
                    this.router.navigate(['/quiz', this.quizId, 'report']);
                }
            },
            error: (error) => {
                console.error('fileControllerUploadFile error:', error);
            }
        });
    }
}