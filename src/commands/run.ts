import { Command, Args } from '@oclif/core';
import * as path from 'path';
import chalk from 'chalk';
import { WorkflowParser } from '../core/workflow-parser.js';
import { WorkflowEngine } from '../core/workflow-engine.js';
import { AdapterManager } from '../core/adapter-manager.js';
import { Logger } from '../utils/logger.js';

export default class Run extends Command {
  static description = 'Run a workflow';
  
  static examples = [
    '<%= config.bin %> <%= command.id %> deploy',
    '<%= config.bin %> <%= command.id %> test',
  ];
  
  static args = {
    workflow: Args.string({
      description: 'Name of the workflow to run',
      required: true,
    }),
  };
  
  async run(): Promise<void> {
    const { args } = await this.parse(Run);
    
    try {
      const configPath = path.join(process.cwd(), 'glue.yaml');
      const parser = new WorkflowParser();
      const config = await parser.parseFile(configPath);
      
      parser.validateWorkflowName(config, args.workflow);
      
      const workflow = config[args.workflow];
      const adapterManager = new AdapterManager();
      const logger = new Logger();
      const engine = new WorkflowEngine(adapterManager, logger);
      
      const result = await engine.execute(workflow);
      
      if (!result.success) {
        this.exit(1);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error(chalk.red(error.message));
      }
      this.exit(1);
    }
  }
}