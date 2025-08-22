import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit } from '@angular/core';
import {  NgxExtendedPdfViewerModule,NgxExtendedPdfViewerService, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { ApplicationInitializerService } from '../../core/services/application-initializer.service';

@Component({
  selector: 'app-example-pdf-viewer',
  templateUrl: './example-pdf-viewer.component.html',
  styleUrls: ['./example-pdf-viewer.component.scss'], 
  standalone: true,
  imports: [NgxExtendedPdfViewerModule],
  providers: [NgxExtendedPdfViewerService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ExamplePdfViewerComponent implements OnInit {
  /** In most cases, you don't need the NgxExtendedPdfViewerService. It allows you
   *  to use the "find" api, to extract text and images from a PDF file,
   *  to print programmatically, and to show or hide layers by a method call.
  */
  constructor(
    private pdfService: NgxExtendedPdfViewerService,
    private appInitializer: ApplicationInitializerService
  ) {
    /* More likely than not you don't need to tweak the pdfDefaultOptions.
       They are a collecton of less frequently used options.
       To illustrate how they're used, here are two example settings: */
    // pdfDefaultOptions.doubleTapZoomFactor = '150%'; // The default value is '200%'
    // pdfDefaultOptions.maxCanvasPixels = 4096 * 4096 * 5; // The default value is 4096 * 4096 pixels,
    // but most devices support much higher resolutions.
    // Increasing this setting allows your users to use higher zoom factors,
    // trading image quality for performance.

    // Configure the assets path for the PDF viewer
    pdfDefaultOptions.assetsFolder = 'assets';
  }

  async ngOnInit() {
    // Ensure PDF viewer assets are loaded
    const assetsAvailable = await this.appInitializer.checkPdfViewerAssets();
    if (!assetsAvailable) {
      console.warn('PDF viewer assets not available, attempting to load...');
      try {
        await this.appInitializer.initializePdfViewer();
      } catch (error) {
        console.error('Failed to load PDF viewer assets:', error);
      }
    }
  }
}
