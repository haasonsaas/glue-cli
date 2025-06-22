import { BaseAdapter } from './base.js';
import type { AdapterOptions } from '../types/adapter.js';
import chalk from 'chalk';

export class NotionAdapter extends BaseAdapter {
  name = 'notion';
  
  constructor() {
    super();
    this.registerAction('create_page', this.createPage);
    this.registerAction('append_to_page', this.appendToPage);
    this.registerAction('update_database', this.updateDatabase);
  }
  
  async authenticate(): Promise<void> {
    console.log(chalk.cyan('Notion Authentication'));
    console.log('');
    console.log('To authenticate with Notion, you need an Integration Token.');
    console.log('');
    console.log('1. Go to https://www.notion.so/my-integrations');
    console.log('2. Create a new integration');
    console.log('3. Copy the "Internal Integration Token"');
    console.log('4. Share the pages/databases with your integration');
    console.log('');
    
    const token = await this.prompt('Enter your Notion Integration Token: ', true);
    
    if (!token) {
      throw new Error('Token cannot be empty');
    }
    
    await this.authManager.saveCredential('notion', 'token', token);
  }
  
  private async createPage(options: AdapterOptions): Promise<void> {
    const { parent_id, title, content } = options as { 
      parent_id: string;
      title: string;
      content?: string;
    };
    
    if (!parent_id || !title) {
      throw new Error('Notion create_page requires "parent_id" and "title" options');
    }
    
    const token = await this.authManager.getCredential('notion', 'token');
    
    if (!token) {
      throw new Error('Notion not authenticated. Run: glue auth notion');
    }
    
    console.log(chalk.gray(`[Notion] Creating page: ${title}`));
    console.log(chalk.gray(`[Notion] Parent: ${parent_id}`));
    if (content) {
      console.log(chalk.gray(`[Notion] Content: ${content.substring(0, 50)}...`));
    }
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  
  private async appendToPage(options: AdapterOptions): Promise<void> {
    const { page_id, content, content_file } = options as { 
      page_id: string;
      content?: string;
      content_file?: string;
    };
    
    if (!page_id || (!content && !content_file)) {
      throw new Error('Notion append_to_page requires "page_id" and either "content" or "content_file"');
    }
    
    const token = await this.authManager.getCredential('notion', 'token');
    
    if (!token) {
      throw new Error('Notion not authenticated. Run: glue auth notion');
    }
    
    console.log(chalk.gray(`[Notion] Appending to page: ${page_id}`));
    if (content) {
      console.log(chalk.gray(`[Notion] Content: ${content.substring(0, 50)}...`));
    } else if (content_file) {
      console.log(chalk.gray(`[Notion] Content from file: ${content_file}`));
    }
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  
  private async updateDatabase(options: AdapterOptions): Promise<void> {
    const { database_id, properties } = options as { 
      database_id: string;
      properties: Record<string, unknown>;
    };
    
    if (!database_id || !properties) {
      throw new Error('Notion update_database requires "database_id" and "properties" options');
    }
    
    const token = await this.authManager.getCredential('notion', 'token');
    
    if (!token) {
      throw new Error('Notion not authenticated. Run: glue auth notion');
    }
    
    console.log(chalk.gray(`[Notion] Updating database: ${database_id}`));
    console.log(chalk.gray(`[Notion] Properties: ${JSON.stringify(properties).substring(0, 50)}...`));
    
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 900));
  }
}