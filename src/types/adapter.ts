export interface AdapterOptions {
  [key: string]: unknown;
}

export interface AdapterAction {
  name: string;
  execute: (options: AdapterOptions) => Promise<void>;
}

export interface Adapter {
  name: string;
  actions: Map<string, AdapterAction>;
  initialize?: () => Promise<void>;
  authenticate?: () => Promise<void>;
}

export interface AdapterConstructor {
  new (): Adapter;
}