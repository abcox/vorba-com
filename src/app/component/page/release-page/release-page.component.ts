import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface ServiceProbeTarget {
  key: string;
  displayName: string;
  baseUrl: string;
}

interface ServiceRuntimeInfo {
  key: string;
  displayName: string;
  baseUrl: string;
  endpointUsed?: string;
  ok: boolean;
  status?: string;
  version?: string;
  serviceVersion?: string;
  buildId?: string;
  buildTimeUtc?: string;
  environment?: string;
  checkedAt: string;
  error?: string;
}

@Component({
  selector: 'app-release-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './release-page.component.html',
  styleUrl: './release-page.component.scss',
})
export class ReleasePageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly serviceStates = signal<ServiceRuntimeInfo[]>([]);

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
      const probeResults = await Promise.all(
        this.getProbeTargets().map((target) => this.probeTarget(target)),
      );
      this.serviceStates.set(probeResults);
    } finally {
      this.refreshing.set(false);
    }
  }

  trackByServiceKey(_index: number, item: ServiceRuntimeInfo): string {
    return item.key;
  }

  private getProbeTargets(): ServiceProbeTarget[] {
    const targets: ServiceProbeTarget[] = [];

    if (environment.fileServiceApiUrl) {
      targets.push({
        key: 'file-service',
        displayName: 'File Service',
        baseUrl: environment.fileServiceApiUrl,
      });
    }

    if (environment.backendApiUrl) {
      targets.push({
        key: 'backend-api',
        displayName: 'Backend API',
        baseUrl: environment.backendApiUrl,
      });
    }

    return targets;
  }

  private async probeTarget(target: ServiceProbeTarget): Promise<ServiceRuntimeInfo> {
    const endpointCandidates = this.getEndpointCandidates(target.baseUrl);

    for (const endpoint of endpointCandidates) {
      try {
        const response = await firstValueFrom(
          this.http.get<Record<string, unknown>>(endpoint).pipe(timeout(7000)),
        );

        return {
          key: target.key,
          displayName: target.displayName,
          baseUrl: target.baseUrl,
          endpointUsed: endpoint,
          ok: true,
          status: this.coerceString(response?.['status']),
          version: this.coerceString(response?.['version']),
          serviceVersion: this.coerceString(response?.['serviceVersion']),
          buildId: this.coerceString(response?.['buildId']),
          buildTimeUtc: this.coerceString(response?.['buildTimeUtc']),
          environment: this.coerceString(response?.['environment']),
          checkedAt: new Date().toISOString(),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Request failed';

        if (endpoint !== endpointCandidates[endpointCandidates.length - 1]) {
          continue;
        }

        return {
          key: target.key,
          displayName: target.displayName,
          baseUrl: target.baseUrl,
          ok: false,
          checkedAt: new Date().toISOString(),
          error: message,
        };
      }
    }

    return {
      key: target.key,
      displayName: target.displayName,
      baseUrl: target.baseUrl,
      ok: false,
      checkedAt: new Date().toISOString(),
      error: 'No endpoints configured',
    };
  }

  private getEndpointCandidates(baseUrl: string): string[] {
    const normalized = baseUrl.replace(/\/$/, '');
    const candidates = [
      `${normalized}/health`,
      `${normalized}/api/health`,
      `${normalized}/details`,
      `${normalized}/api/details`,
    ];

    return [...new Set(candidates)];
  }

  private coerceString(value: unknown): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    return String(value);
  }

  private getClientBuildTimeHint(): string {
    const buildHint = new Date(document.lastModified);
    return Number.isNaN(buildHint.getTime())
      ? 'unknown'
      : buildHint.toISOString();
  }
}
