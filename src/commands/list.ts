import { Command } from '@oclif/core';
import * as path from 'path';
import chalk from 'chalk';
import { WorkflowParser } from '../core/workflow-parser.js';

export default class List extends Command {
  static description = 'List all available workflows';
  
  static examples = ['<%= config.bin %> <%= command.id %>'];
  
  async run(): Promise<void> {
    try {
      const configPath = path.join(process.cwd(), 'glue.yaml');
      const parser = new WorkflowParser();
      const config = await parser.parseFile(configPath);
      
      const workflows = Object.keys(config);
      
      if (workflows.length === 0) {
        this.log(chalk.yellow('No workflows found in glue.yaml'));
        return;
      }
      
      this.log(chalk.bold('Available workflows:\n'));
      
      for (const workflowName of workflows) {
        const workflow = config[workflowName];
        this.log(chalk.cyan(`  ${workflowName}`));
        this.log(chalk.gray(`    Steps: ${workflow.steps.length}`));
        
        for (const step of workflow.steps) {
          const stepType = 'run' in step ? 'local' : `${step.adapter}:${step.action}`;
          this.log(chalk.gray(`      - ${step.name} (${stepType})`));
        }
        this.log('');
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error(chalk.red(error.message));
      }
      this.exit(1);
    }
  }
}