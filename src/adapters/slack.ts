import { BaseAdapter } from './base.js';
import type { AdapterOptions } from '../types/adapter.js';
import chalk from 'chalk';

export class SlackAdapter extends BaseAdapter {
  name = 'slack';
  
  constructor() {
    super();
    this.registerAction('notify', this.notify);
    this.registerAction('upload_file', this.uploadFile);
  }
  
  async authenticate(): Promise<void> {
    console.log(chalk.cyan('Slack Authentication'));
    console.log('');
    console.log('To authenticate with Slack, you need a Bot User OAuth Token.');
    console.log('');
    console.log('1. Go to https://api.slack.com/apps');
    console.log('2. Create a new app or select an existing one');
    console.log('3. Go to "OAuth & Permissions"');
    console.log('4. Copy the "Bot User OAuth Token" (starts with xoxb-)');
    console.log('');
    
    const token = await this.prompt('Enter your Slack Bot Token: ', true);
    
    if (!token.startsWith('xoxb-')) {
      throw new Error('Invalid token format. Slack bot tokens should start with "xoxb-"');
    }
    
    await this.authManager.saveCredential('slack', 'token', token);
  }
  
  private async notify(options: AdapterOptions): Promise<void> {
    const { channel, message } = options as { channel: string; message: string };
    
    if (!channel || !message) {
      throw new Error('Slack notify requires "channel" and "message" options');
    }
    
    const token = await this.authManager.getCredential('slack', 'token');
    
    if (!token) {
      throw new Error('Slack not authenticated. Run: glue auth slack');
    }
    
    // In a real implementation, this would make an API call to Slack
    console.log(chalk.gray(`[Slack] Sending to ${channel}: ${message}`));
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  
  private async uploadFile(options: AdapterOptions): Promise<void> {
    const { channel, file, comment } = options as { 
      channel: string; 
      file: string; 
      comment?: string;
    };
    
    if (!channel || !file) {
      throw new Error('Slack upload_file requires "channel" and "file" options');
    }
    
    const token = await this.authManager.getCredential('slack', 'token');
    
    if (!token) {
      throw new Error('Slack not authenticated. Run: glue auth slack');
    }
    
    // In a real implementation, this would upload the file to Slack
    console.log(chalk.gray(`[Slack] Uploading ${file} to ${channel}`));
    if (comment) {
      console.log(chalk.gray(`[Slack] Comment: ${comment}`));
    }
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}