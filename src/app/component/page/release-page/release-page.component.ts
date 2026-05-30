import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { DiagnosticService, ServiceStatusDto } from '@file-service-api/v1';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-release-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './release-page.component.html',
  styleUrl: './release-page.component.scss',
})
export class ReleasePageComponent implements OnInit {
  private readonly diagnosticService = inject(DiagnosticService);

  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly serviceStates = signal<ServiceStatusDto[]>([]);

  readonly title = 'Release Notes & Runtime Manifest';

  readonly clientBuildInfo = {
    appName: 'vorba-web',
    buildLabel: environment.name,
    environment: environment.production ? 'production' : 'development',
    buildTimeUtc: this.getClientBuildTimeHint(),
  };

  async ngOnInit(): Promise<void> {
    await this.refresh();
    this.loading.set(false);
  }

  async refresh(): Promise<void> {
    this.refreshing.set(true);
    try {
      const report = await firstValueFrom(
        this.diagnosticService
          .diagnosticControllerGetDiagnosticReport()
          .pipe(timeout(7000)),
      );

      this.serviceStates.set(report.services ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';

      this.serviceStates.set([
        {
          name: 'file-service-diagnostics',
          displayName: 'File Service Diagnostics',
          status: ServiceStatusDto.StatusEnum.Unavailable,
          reason: message,
          baseUrl: environment.fileServiceApiUrl || 'not configured',
          endpointUsed: '/api/diagnostic/services',
          checkedAt: new Date().toISOString(),
          environment: environment.name,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      this.refreshing.set(false);
    }
  }

  trackByServiceName(_index: number, item: ServiceStatusDto): string {
    return item.name;
  }

  isReady(service: ServiceStatusDto): boolean {
    return service.status === ServiceStatusDto.StatusEnum.Ready;
  }

  private getClientBuildTimeHint(): string {
    const buildHint = new Date(document.lastModified);
    return Number.isNaN(buildHint.getTime())
      ? 'unknown'
      : buildHint.toISOString();
  }
}
