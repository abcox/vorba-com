import { Injectable } from '@angular/core';
import { ApplicationConfig } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApplicationInitializerService {

  constructor() { }

  /**
   * Initialize PDF viewer assets by dynamically loading required modules
   */
  async initializePdfViewer(): Promise<void> {
    try {
      console.log('Initializing PDF viewer assets...');
      
      // Load the main PDF viewer module
      await this.loadScript('/assets/viewer-5.4.793.min.mjs', 'application/javascript');
      
      // Load the PDF worker module
      await this.loadScript('/assets/pdf.worker-5.4.793.min.mjs', 'application/javascript');
      
      // Load the PDF sandbox module
      await this.loadScript('/assets/pdf.sandbox-5.4.793.min.mjs', 'application/javascript');
      
      console.log('PDF viewer assets loaded successfully');
    } catch (error) {
      console.error('Failed to load PDF viewer assets:', error);
      throw error;
    }
  }

  /**
   * Dynamically load a script with proper MIME type
   */
  private loadScript(src: string, type: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = type;
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        console.log(`Loaded script: ${src}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.error(`Failed to load script: ${src}`, error);
        reject(new Error(`Failed to load script: ${src}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Check if PDF viewer assets are available
   */
  async checkPdfViewerAssets(): Promise<boolean> {
    try {
      const assets = [
        '/assets/viewer-5.4.793.min.js',
        '/assets/pdf.worker-5.4.793.min.js',
        '/assets/pdf.sandbox-5.4.793.min.js'
      ];
      
      for (const asset of assets) {
        const response = await fetch(asset, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`PDF viewer asset not found: ${asset}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking PDF viewer assets:', error);
      return false;
    }
  }
}

/**
 * Factory function to create the application initializer
 */
export function initializePdfViewer(service: ApplicationInitializerService) {
  return () => service.initializePdfViewer();
}