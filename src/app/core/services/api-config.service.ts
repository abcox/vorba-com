import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Configuration, ConfigurationParameters } from '@backend-api/v1';

// configure backend api
export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: environment.apiUrl,
  };
  return new Configuration(params);
}

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private configuration: Configuration;

  constructor() {
    this.configuration = new Configuration({
      basePath: environment.apiUrl
    });
  }

  // todo: do we need this?  (i moved apiConfigFactory from app.config to this code file -- see above)
  getConfiguration(): Configuration {
    return this.configuration;
  }
} 