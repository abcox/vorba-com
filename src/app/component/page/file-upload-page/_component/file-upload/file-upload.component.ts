import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  @Input() selectedFiles: File[] = [];
  selectedFilesCountMax = input(1);
  loading = input(false);
  @Output() filesSelected = new EventEmitter<File[]>();

  isDragOver = false;
  uploadProgress = 0;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]) {
    const invalidFiles = files.filter(file => {
      const maxSize = 100 * 1024 * 1024; // 100MB
      return file.size > maxSize;
    });
    if (invalidFiles.length > 0) {
      //this.invalidFiles.emit(invalidFiles);
      // TODO: show these files in the list with some warning icon
      console.warn('invalidFiles', invalidFiles);
    }
    // Filter out invalid files
    const validFiles = files.filter(file => {
      // Add your file validation logic here
      const maxSize = 100 * 1024 * 1024; // 100MB
      return file.size <= maxSize;
    });

    if (validFiles.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
      this.filesSelected.emit(this.selectedFiles);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.filesSelected.emit(this.selectedFiles);
  }

  clearAllFiles() {
    this.selectedFiles = [];
    this.filesSelected.emit(this.selectedFiles);
  }

  getTotalSize(): string {
    const totalBytes = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
    return this.formatFileSize(totalBytes);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'table_chart';
      case 'ppt':
      case 'pptx':
        return 'slideshow';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return 'image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'video_file';
      case 'mp3':
      case 'wav':
      case 'flac':
        return 'audio_file';
      case 'zip':
      case 'rar':
      case '7z':
        return 'folder_zip';
      case 'txt':
        return 'article';
      default:
        return 'insert_drive_file';
    }
  }
}
