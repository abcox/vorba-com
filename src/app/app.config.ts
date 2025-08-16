import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApiModule as BackendApiModule } from '@backend-api/v1';
import { ApiModule as FileServiceApiModule } from '@file-service-api/v1';
import { backendApiConfigFactory, fileServiceApiConfigFactory } from './core/services/api-config.service';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { provideNgIdle } from '@ng-idle/core';
import { provideNgIdleKeepalive } from '@ng-idle/keepalive';

export const TOKEN_KEY = 'token'; // todo: move to a shared constant file -- candidate for InjectionToken?

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    ),
    provideNgIdle(),
    provideNgIdleKeepalive(),
    //{ provide: Configuration, useFactory: apiConfigFactory },    
    importProvidersFrom(BackendApiModule.forRoot(backendApiConfigFactory)),
    importProvidersFrom(FileServiceApiModule.forRoot(fileServiceApiConfigFactory)),
  ]
};
