import { Adapter, AdapterConstructor } from '../types/adapter.js';
import { SlackAdapter } from '../adapters/slack.js';
import { GitHubAdapter } from '../adapters/github.js';
import { GCPAdapter } from '../adapters/gcp.js';
import { NotionAdapter } from '../adapters/notion.js';
import { LinearAdapter } from '../adapters/linear.js';

export class AdapterManager {
  private adapters = new Map<string, Adapter>();
  
  constructor() {
    this.registerBuiltInAdapters();
  }
  
  private registerBuiltInAdapters(): void {
    const builtInAdapters: AdapterConstructor[] = [
      SlackAdapter,
      GitHubAdapter,
      GCPAdapter,
      NotionAdapter,
      LinearAdapter,
    ];
    
    for (const AdapterClass of builtInAdapters) {
      const adapter = new AdapterClass();
      this.registerAdapter(adapter);
    }
  }
  
  registerAdapter(adapter: Adapter): void {
    this.adapters.set(adapter.name, adapter);
  }
  
  getAdapter(name: string): Adapter | undefined {
    return this.adapters.get(name);
  }
  
  getAllAdapters(): Adapter[] {
    return Array.from(this.adapters.values());
  }
  
  async initializeAdapter(name: string): Promise<void> {
    const adapter = this.getAdapter(name);
    
    if (!adapter) {
      throw new Error(`Adapter "${name}" not found`);
    }
    
    if (adapter.initialize) {
      await adapter.initialize();
    }
  }
  
  async authenticateAdapter(name: string): Promise<void> {
    const adapter = this.getAdapter(name);
    
    if (!adapter) {
      throw new Error(`Adapter "${name}" not found`);
    }
    
    if (adapter.authenticate) {
      await adapter.authenticate();
    } else {
      throw new Error(`Adapter "${name}" does not support authentication`);
    }
  }
}