import { Injectable, inject } from '@angular/core';
import { EmailService } from '@backend-api/v1/api/email.service';
import { EmailServiceRequest } from '@backend-api/v1/model/emailServiceRequest';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@src/environments/environment';

interface FakeApiConfig {
  shouldSucceed: boolean;
  delayMs?: number;
  errorMessage?: string;
}

/**
 * Facade for email delivery that abstracts local fake behavior from components.
 */
@Injectable({
  providedIn: 'root'
})
export class EmailProvider {
  private emailService = inject(EmailService);

  private useFakeApi = !environment.production;
  private fakeApiConfig: FakeApiConfig = {
    shouldSucceed: true,
    delayMs: 2000,
    errorMessage: 'Failed to send email. Please try again later.'
  };

  /**
   * Sends email through real backend in production and fake API in local development.
   */
  sendEmail(request: EmailServiceRequest): Observable<unknown> {
    if (!this.useFakeApi) {
      return this.emailService.sendEmail(request);
    }

    const { shouldSucceed, delayMs = 2000, errorMessage } = this.fakeApiConfig;
    const response$ = shouldSucceed
      ? of({ success: true })
      : throwError(() => new Error(errorMessage));

    return response$.pipe(delay(delayMs));
  }

  /**
   * Enables overriding fake API behavior for local testing.
   */
  configureFakeApi(config: Partial<FakeApiConfig>): void {
    this.fakeApiConfig = { ...this.fakeApiConfig, ...config };
  }

  /**
   * Forces fake API on or off at runtime for debugging.
   */
  setFakeApiEnabled(enabled: boolean): void {
    this.useFakeApi = enabled;
  }
}
