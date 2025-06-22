import { BaseAdapter } from './base.js';
import type { AdapterOptions } from '../types/adapter.js';
import chalk from 'chalk';
import axios from 'axios';

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
    
    try {
      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel,
          text: message,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }
      
      console.log(chalk.gray(`[Slack] Message sent to ${channel}}`));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to send Slack message: ${error.message}`);
      }
      throw error;
    }
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
    
    try {
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(file);
      const fileName = file.split('/').pop() || 'file';
      
      const formData = new FormData();
      formData.append('channels', channel);
      formData.append('file', new Blob([fileContent]), fileName);
      if (comment) {
        formData.append('initial_comment', comment);
      }
      
      const response = await axios.post(
        'https://slack.com/api/files.upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.data.ok) {
        throw new Error(`Slack API error: ${response.data.error}`);
      }
      
      console.log(chalk.gray(`[Slack] File uploaded to ${channel}`));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to upload file to Slack: ${error.message}`);
      }
      throw error;
    }
  }
}