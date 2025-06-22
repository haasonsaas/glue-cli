import { BaseAdapter } from './base.js';
import type { AdapterOptions } from '../types/adapter.js';
import chalk from 'chalk';
import axios from 'axios';

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
    
    try {
      const [owner, repoName] = repo.split('/');
      if (!owner || !repoName) {
        throw new Error('Repository must be in format "owner/repo"');
      }
      
      const response = await axios.post(
        `https://api.github.com/repos/${owner}/${repoName}/issues`,
        {
          title,
          body: body || '',
          labels: labels || [],
        },
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      console.log(chalk.gray(`[GitHub] Issue created: ${response.data.html_url}`));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create GitHub issue: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
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
    
    try {
      const [owner, repoName] = repo.split('/');
      if (!owner || !repoName) {
        throw new Error('Repository must be in format "owner/repo"');
      }
      
      const updateData: any = {};
      if (state) updateData.state = state;
      if (body) updateData.body = body;
      
      await axios.patch(
        `https://api.github.com/repos/${owner}/${repoName}/pulls/${pr_number}`,
        updateData,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      console.log(chalk.gray(`[GitHub] PR #${pr_number} updated`));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update GitHub PR: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
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
    
    try {
      const [owner, repoName] = repo.split('/');
      if (!owner || !repoName) {
        throw new Error('Repository must be in format "owner/repo"');
      }
      
      await axios.post(
        `https://api.github.com/repos/${owner}/${repoName}/issues/${issue_number}/comments`,
        { body },
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      console.log(chalk.gray(`[GitHub] Comment added to #${issue_number}`));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to add GitHub comment: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}