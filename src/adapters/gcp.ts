import { BaseAdapter } from './base.js';
import type { AdapterOptions } from '../types/adapter.js';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

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
    
    try {
      let queryText = query;
      if (query_file) {
        queryText = await fs.readFile(query_file, 'utf-8');
      }
      
      const datasetFlag = dataset ? `--dataset_id=${dataset}` : '';
      const command = `GOOGLE_APPLICATION_CREDENTIALS="${keyfile}" bq query --project_id="${projectId}" ${datasetFlag} --format=json "${queryText}"`;
      
      console.log(chalk.gray(`[GCP BigQuery] Running query...`));
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.warn(chalk.yellow(`[GCP BigQuery] Warning: ${stderr}`));
      }
      
      const results = JSON.parse(stdout);
      console.log(chalk.gray(`[GCP BigQuery] Query completed: ${results.length} rows returned`));
    } catch (error) {
      throw new Error(`Failed to execute BigQuery: ${error instanceof Error ? error.message : String(error)}`);
    }
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
    
    try {
      const dest = destination || source.split('/').pop();
      const command = `GOOGLE_APPLICATION_CREDENTIALS="${keyfile}" gsutil -q cp "${source}" "gs://${bucket}/${dest}"`;
      
      console.log(chalk.gray(`[GCP Storage] Uploading ${source}...`));
      await execAsync(command);
      
      console.log(chalk.gray(`[GCP Storage] Uploaded to gs://${bucket}/${dest}`));
    } catch (error) {
      throw new Error(`Failed to upload to GCS: ${error instanceof Error ? error.message : String(error)}`);
    }
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
    
    try {
      const regionFlag = region ? `--region=${region}` : '--region=us-central1';
      const dataFlag = data ? `--data='${JSON.stringify(data)}'` : '';
      const command = `GOOGLE_APPLICATION_CREDENTIALS="${keyfile}" gcloud functions call ${name} --project="${projectId}" ${regionFlag} ${dataFlag}`;
      
      console.log(chalk.gray(`[GCP Functions] Invoking ${name}...`));
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.warn(chalk.yellow(`[GCP Functions] Warning: ${stderr}`));
      }
      
      console.log(chalk.gray(`[GCP Functions] Function executed successfully`));
      if (stdout) {
        console.log(chalk.gray(`[GCP Functions] Response: ${stdout.substring(0, 100)}...`));
      }
    } catch (error) {
      throw new Error(`Failed to invoke Cloud Function: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}