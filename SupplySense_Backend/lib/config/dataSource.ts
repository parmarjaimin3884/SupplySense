export type DataSourceType = 'mock' | 'api';

export class DataSourceConfig {
  static get current(): DataSourceType {
    const envSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    if (envSource === 'api') return 'api';
    return 'mock';
  }

  static get isMock(): boolean {
    return this.current === 'mock';
  }

  static get isApi(): boolean {
    return this.current === 'api';
  }
}
