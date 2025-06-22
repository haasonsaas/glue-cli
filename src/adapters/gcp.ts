import { BaseAdapter } from './base.js';
import { AdapterOptions } from '../types/adapter.js';
import chalk from 'chalk';

export class GCPAdapter extends BaseAdapter {
  name = 'gcp';
  
  constructor() {
    super();
    this.registerAction('bq', this.bigQuery);
    this.registerAction('gcs_upload', this.storageUpload);
    this.registerAction('function_invoke', this.invokeFunction);
  }
  
  async authenticate(): Promise<void> {
    console.log(chalk.cyan('GCP Authentication'));
    console.log('');
    console.log('To authenticate with GCP, you need a Service Account key file.');
    console.log('');
    console.log('1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts');
    console.log('2. Create a service account or select an existing one');
    console.log('3. Create a new key (JSON format)');
    console.log('4. Download the key file');
    console.log('');
    
    const keyPath = await this.prompt('Enter the path to your GCP service account key file: ');
    
    if (!keyPath) {
      throw new Error('Key file path cannot be empty');
    }
    
    await this.authManager.saveCredential('gcp', 'keyfile', keyPath);
    
    const projectId = await this.prompt('Enter your GCP project ID: ');
    
    if (!projectId) {
      throw new Error('Project ID cannot be empty');
    }
    
    await this.authManager.saveCredential('gcp', 'project_id', projectId);
  }
  
  private async bigQuery(options: AdapterOptions): Promise<void> {
    const { query, query_file, dataset } = options as { 
      query?: string;
      query_file?: string;
      dataset?: string;
    };
    
    if (!query && !query_file) {
      throw new Error('GCP bq requires either "query" or "query_file" option');
    }
    
    const keyfile = await this.authManager.getCredential('gcp', 'keyfile');
    const projectId = await this.authManager.getCredential('gcp', 'project_id');
    
    if (!keyfile || !projectId) {
      throw new Error('GCP not authenticated. Run: glue auth gcp');
    }
    
    console.log(chalk.gray(`[GCP BigQuery] Project: ${projectId}`));
    if (dataset) {
      console.log(chalk.gray(`[GCP BigQuery] Dataset: ${dataset}`));
    }
    if (query) {
      console.log(chalk.gray(`[GCP BigQuery] Query: ${query.substring(0, 50)}...`));
    } else if (query_file) {
      console.log(chalk.gray(`[GCP BigQuery] Query file: ${query_file}`));
    }
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  
  private async storageUpload(options: AdapterOptions): Promise<void> {
    const { source, bucket, destination } = options as { 
      source: string;
      bucket: string;
      destination?: string;
    };
    
    if (!source || !bucket) {
      throw new Error('GCP gcs_upload requires "source" and "bucket" options');
    }
    
    const keyfile = await this.authManager.getCredential('gcp', 'keyfile');
    const projectId = await this.authManager.getCredential('gcp', 'project_id');
    
    if (!keyfile || !projectId) {
      throw new Error('GCP not authenticated. Run: glue auth gcp');
    }
    
    console.log(chalk.gray(`[GCP Storage] Uploading ${source} to gs://${bucket}/${destination || source}`));
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  
  private async invokeFunction(options: AdapterOptions): Promise<void> {
    const { name, data, region } = options as { 
      name: string;
      data?: unknown;
      region?: string;
    };
    
    if (!name) {
      throw new Error('GCP function_invoke requires "name" option');
    }
    
    const keyfile = await this.authManager.getCredential('gcp', 'keyfile');
    const projectId = await this.authManager.getCredential('gcp', 'project_id');
    
    if (!keyfile || !projectId) {
      throw new Error('GCP not authenticated. Run: glue auth gcp');
    }
    
    console.log(chalk.gray(`[GCP Functions] Invoking ${name}`));
    if (region) {
      console.log(chalk.gray(`[GCP Functions] Region: ${region}`));
    }
    if (data) {
      console.log(chalk.gray(`[GCP Functions] Data: ${JSON.stringify(data).substring(0, 50)}...`));
    }
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
}