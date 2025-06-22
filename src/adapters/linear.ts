import { BaseAdapter } from './base.js';
import type { AdapterOptions } from '../types/adapter.js';
import chalk from 'chalk';

export class LinearAdapter extends BaseAdapter {
  name = 'linear';
  
  constructor() {
    super();
    this.registerAction('create_issue', this.createIssue);
    this.registerAction('update_issue', this.updateIssue);
    this.registerAction('add_comment', this.addComment);
  }
  
  async authenticate(): Promise<void> {
    console.log(chalk.cyan('Linear Authentication'));
    console.log('');
    console.log('To authenticate with Linear, you need an API key.');
    console.log('');
    console.log('1. Go to https://linear.app/settings/api');
    console.log('2. Create a new personal API key');
    console.log('3. Copy the generated key');
    console.log('');
    
    const apiKey = await this.prompt('Enter your Linear API Key: ', true);
    
    if (!apiKey) {
      throw new Error('API key cannot be empty');
    }
    
    await this.authManager.saveCredential('linear', 'api_key', apiKey);
  }
  
  private async createIssue(options: AdapterOptions): Promise<void> {
    const { team, title, description, priority, assignee } = options as { 
      team: string;
      title: string;
      description?: string;
      priority?: string;
      assignee?: string;
    };
    
    if (!team || !title) {
      throw new Error('Linear create_issue requires "team" and "title" options');
    }
    
    const apiKey = await this.authManager.getCredential('linear', 'api_key');
    
    if (!apiKey) {
      throw new Error('Linear not authenticated. Run: glue auth linear');
    }
    
    console.log(chalk.gray(`[Linear] Creating issue for team ${team}: ${title}`));
    if (description) {
      console.log(chalk.gray(`[Linear] Description: ${description.substring(0, 50)}...`));
    }
    if (priority) {
      console.log(chalk.gray(`[Linear] Priority: ${priority}`));
    }
    if (assignee) {
      console.log(chalk.gray(`[Linear] Assignee: ${assignee}`));
    }
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  
  private async updateIssue(options: AdapterOptions): Promise<void> {
    const { issue_id, state, priority, assignee } = options as { 
      issue_id: string;
      state?: string;
      priority?: string;
      assignee?: string;
    };
    
    if (!issue_id) {
      throw new Error('Linear update_issue requires "issue_id" option');
    }
    
    const apiKey = await this.authManager.getCredential('linear', 'api_key');
    
    if (!apiKey) {
      throw new Error('Linear not authenticated. Run: glue auth linear');
    }
    
    console.log(chalk.gray(`[Linear] Updating issue: ${issue_id}`));
    if (state) {
      console.log(chalk.gray(`[Linear] State: ${state}`));
    }
    if (priority) {
      console.log(chalk.gray(`[Linear] Priority: ${priority}`));
    }
    if (assignee) {
      console.log(chalk.gray(`[Linear] Assignee: ${assignee}`));
    }
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  
  private async addComment(options: AdapterOptions): Promise<void> {
    const { issue_id, comment } = options as { 
      issue_id: string;
      comment: string;
    };
    
    if (!issue_id || !comment) {
      throw new Error('Linear add_comment requires "issue_id" and "comment" options');
    }
    
    const apiKey = await this.authManager.getCredential('linear', 'api_key');
    
    if (!apiKey) {
      throw new Error('Linear not authenticated. Run: glue auth linear');
    }
    
    console.log(chalk.gray(`[Linear] Adding comment to issue: ${issue_id}`));
    console.log(chalk.gray(`[Linear] Comment: ${comment.substring(0, 50)}...`));
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}