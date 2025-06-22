import { BaseAdapter } from './base.js';
import type { AdapterOptions } from '../types/adapter.js';
import chalk from 'chalk';
import axios from 'axios';
import * as fs from 'fs/promises';

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
    
    try {
      const children = [];
      if (content) {
        children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content }
            }]
          }
        });
      }
      
      const response = await axios.post(
        'https://api.notion.com/v1/pages',
        {
          parent: { page_id: parent_id },
          properties: {
            title: {
              title: [{
                text: { content: title }
              }]
            }
          },
          children
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log(chalk.gray(`[Notion] Page created: ${response.data.url}`));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create Notion page: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
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
    
    try {
      let textContent = content;
      if (content_file) {
        textContent = await fs.readFile(content_file, 'utf-8');
      }
      
      await axios.patch(
        `https://api.notion.com/v1/blocks/${page_id}/children`,
        {
          children: [{
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{
                type: 'text',
                text: { content: textContent }
              }]
            }
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log(chalk.gray(`[Notion] Content appended to page`));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to append to Notion page: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
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
    
    try {
      await axios.post(
        'https://api.notion.com/v1/pages',
        {
          parent: { database_id },
          properties
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log(chalk.gray(`[Notion] Database entry created`));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update Notion database: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}