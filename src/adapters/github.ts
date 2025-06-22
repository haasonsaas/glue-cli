import { BaseAdapter } from './base.js';
import { AdapterOptions } from '../types/adapter.js';
import chalk from 'chalk';

export class GitHubAdapter extends BaseAdapter {
  name = 'github';
  
  constructor() {
    super();
    this.registerAction('create_issue', this.createIssue);
    this.registerAction('update_pr', this.updatePullRequest);
    this.registerAction('comment', this.addComment);
  }
  
  async authenticate(): Promise<void> {
    console.log(chalk.cyan('GitHub Authentication'));
    console.log('');
    console.log('To authenticate with GitHub, you need a Personal Access Token.');
    console.log('');
    console.log('1. Go to https://github.com/settings/tokens');
    console.log('2. Click "Generate new token (classic)"');
    console.log('3. Select the necessary scopes (repo, workflow, etc.)');
    console.log('4. Copy the generated token');
    console.log('');
    
    const token = await this.prompt('Enter your GitHub Personal Access Token: ', true);
    
    if (!token) {
      throw new Error('Token cannot be empty');
    }
    
    await this.authManager.saveCredential('github', 'token', token);
  }
  
  private async createIssue(options: AdapterOptions): Promise<void> {
    const { repo, title, body, labels } = options as { 
      repo: string; 
      title: string; 
      body?: string;
      labels?: string[];
    };
    
    if (!repo || !title) {
      throw new Error('GitHub create_issue requires "repo" and "title" options');
    }
    
    const token = await this.authManager.getCredential('github', 'token');
    
    if (!token) {
      throw new Error('GitHub not authenticated. Run: glue auth github');
    }
    
    console.log(chalk.gray(`[GitHub] Creating issue in ${repo}: ${title}`));
    if (body) {
      console.log(chalk.gray(`[GitHub] Body: ${body.substring(0, 50)}...`));
    }
    if (labels) {
      console.log(chalk.gray(`[GitHub] Labels: ${labels.join(', ')}`));
    }
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  
  private async updatePullRequest(options: AdapterOptions): Promise<void> {
    const { repo, pr_number, state, body } = options as { 
      repo: string; 
      pr_number: number; 
      state?: 'open' | 'closed';
      body?: string;
    };
    
    if (!repo || !pr_number) {
      throw new Error('GitHub update_pr requires "repo" and "pr_number" options');
    }
    
    const token = await this.authManager.getCredential('github', 'token');
    
    if (!token) {
      throw new Error('GitHub not authenticated. Run: glue auth github');
    }
    
    console.log(chalk.gray(`[GitHub] Updating PR #${pr_number} in ${repo}`));
    if (state) {
      console.log(chalk.gray(`[GitHub] State: ${state}`));
    }
    if (body) {
      console.log(chalk.gray(`[GitHub] Body: ${body.substring(0, 50)}...`));
    }
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  
  private async addComment(options: AdapterOptions): Promise<void> {
    const { repo, issue_number, body } = options as { 
      repo: string; 
      issue_number: number; 
      body: string;
    };
    
    if (!repo || !issue_number || !body) {
      throw new Error('GitHub comment requires "repo", "issue_number", and "body" options');
    }
    
    const token = await this.authManager.getCredential('github', 'token');
    
    if (!token) {
      throw new Error('GitHub not authenticated. Run: glue auth github');
    }
    
    console.log(chalk.gray(`[GitHub] Adding comment to #${issue_number} in ${repo}`));
    console.log(chalk.gray(`[GitHub] Comment: ${body.substring(0, 50)}...`));
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}