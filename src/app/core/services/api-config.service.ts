import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Configuration as BackendApiConfig,
  ConfigurationParameters as BackendApiConfigParams
} from '@backend-api/v1';
import {
  Configuration as FileServiceConfig,
  ConfigurationParameters as FileServiceConfigParams } from '@file-service-api/v1';


// configure backend api
export function backendApiConfigFactory(): BackendApiConfig {
  const params: BackendApiConfigParams = {
    basePath: environment.backendApiUrl,
  };
  return new BackendApiConfig(params);
}

// configure file service api
export function fileServiceApiConfigFactory(): FileServiceConfig {
  const params: FileServiceConfigParams = {
    basePath: environment.fileServiceApiUrl,
  };
  return new FileServiceConfig(params);
}


@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private backendApiConfiguration: BackendApiConfig;
  private fileServiceApiConfiguration: FileServiceConfig;

  constructor() {
    this.backendApiConfiguration = new BackendApiConfig({
      basePath: environment.backendApiUrl
    });
    this.fileServiceApiConfiguration = new FileServiceConfig({
      basePath: environment.fileServiceApiUrl
    });
  }

  // todo: do we need this?  (i moved apiConfigFactory from app.config to this code file -- see above)
  getConfiguration(): {
    backendApiConfiguration: BackendApiConfig;
    fileServiceApiConfiguration: FileServiceConfig;
  } {
    return {
      backendApiConfiguration: this.backendApiConfiguration,
      fileServiceApiConfiguration: this.fileServiceApiConfiguration
    };
  }
} 