import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import type { GlueConfig } from '../types/workflow.js';
import { GlueConfigSchema } from '../types/workflow.js';

export class WorkflowParser {
  async parseFile(filePath: string): Promise<GlueConfig> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const rawConfig = yaml.load(fileContent) as unknown;
      
      const result = GlueConfigSchema.safeParse(rawConfig);
      
      if (!result.success) {
        throw new Error(
          `Invalid workflow configuration: ${result.error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', ')}`
        );
      }
      
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse workflow file: ${error.message}`);
      }
      throw error;
    }
  }
  
  validateWorkflowName(config: GlueConfig, workflowName: string): void {
    if (!config[workflowName]) {
      const availableWorkflows = Object.keys(config);
      throw new Error(
        `Workflow "${workflowName}" not found. Available workflows: ${availableWorkflows.join(', ')}`
      );
    }
  }
}