import { BaseAdapter } from './base.js';
import type { AdapterOptions } from '../types/adapter.js';
import chalk from 'chalk';
import axios from 'axios';

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
    const { team, title, description, priority } = options as { 
      team: string;
      title: string;
      description?: string;
      priority?: string;
    };
    
    if (!team || !title) {
      throw new Error('Linear create_issue requires "team" and "title" options');
    }
    
    const apiKey = await this.authManager.getCredential('linear', 'api_key');
    
    if (!apiKey) {
      throw new Error('Linear not authenticated. Run: glue auth linear');
    }
    
    try {
      // First, get the team ID
      const teamQuery = `
        query Teams {
          teams(filter: { name: { eq: "${team}" } }) {
            nodes {
              id
              name
            }
          }
        }
      `;
      
      const teamResponse = await axios.post(
        'https://api.linear.app/graphql',
        { query: teamQuery },
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const teamId = teamResponse.data.data?.teams?.nodes?.[0]?.id;
      if (!teamId) {
        throw new Error(`Team "${team}" not found`);
      }
      
      // Create the issue
      const mutation = `
        mutation IssueCreate($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              identifier
              url
            }
          }
        }
      `;
      
      const variables = {
        input: {
          teamId,
          title,
          description,
          priority: priority ? parseInt(priority) : undefined,
        }
      };
      
      const response = await axios.post(
        'https://api.linear.app/graphql',
        { query: mutation, variables },
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const issue = response.data.data?.issueCreate?.issue;
      if (issue) {
        console.log(chalk.gray(`[Linear] Issue created: ${issue.identifier} - ${issue.url}`));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create Linear issue: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      throw error;
    }
  }
  
  private async updateIssue(options: AdapterOptions): Promise<void> {
    const { issue_id, state, priority } = options as { 
      issue_id: string;
      state?: string;
      priority?: string;
    };
    
    if (!issue_id) {
      throw new Error('Linear update_issue requires "issue_id" option');
    }
    
    const apiKey = await this.authManager.getCredential('linear', 'api_key');
    
    if (!apiKey) {
      throw new Error('Linear not authenticated. Run: glue auth linear');
    }
    
    try {
      const mutation = `
        mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) {
            success
            issue {
              id
              identifier
              state {
                name
              }
            }
          }
        }
      `;
      
      const input: any = {};
      if (priority) input.priority = parseInt(priority);
      if (state) input.stateId = state; // Note: This would need state ID lookup in real implementation
      
      const variables = {
        id: issue_id,
        input
      };
      
      const response = await axios.post(
        'https://api.linear.app/graphql',
        { query: mutation, variables },
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.data?.issueUpdate?.success) {
        console.log(chalk.gray(`[Linear] Issue ${issue_id} updated`));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update Linear issue: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      throw error;
    }
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
    
    try {
      const mutation = `
        mutation CommentCreate($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            success
            comment {
              id
              body
            }
          }
        }
      `;
      
      const variables = {
        input: {
          issueId: issue_id,
          body: comment
        }
      };
      
      const response = await axios.post(
        'https://api.linear.app/graphql',
        { query: mutation, variables },
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.data?.commentCreate?.success) {
        console.log(chalk.gray(`[Linear] Comment added to issue ${issue_id}`));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to add Linear comment: ${error.response?.data?.errors?.[0]?.message || error.message}`);
      }
      throw error;
    }
  }
}