import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { Logger } from '../utils/logger.js';

export default class History extends Command {
  static description = 'Show workflow execution history';
  
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --limit 50',
  ];
  
  static flags = {
    limit: Flags.integer({
      char: 'l',
      description: 'Number of entries to show',
      default: 20,
    }),
    clear: Flags.boolean({
      description: 'Clear all history',
      default: false,
    }),
  };
  
  async run(): Promise<void> {
    const { flags } = await this.parse(History);
    const logger = new Logger();
    
    if (flags.clear) {
      await logger.clearHistory();
      this.log(chalk.green('✓ History cleared'));
      return;
    }
    
    const history = await logger.getHistory(flags.limit);
    
    if (history.length === 0) {
      this.log(chalk.yellow('No workflow executions found'));
      return;
    }
    
    this.log(chalk.bold('Workflow Execution History:\n'));
    
    for (const entry of history) {
      const status = entry.success ? chalk.green('✓') : chalk.red('✗');
      const date = new Date(entry.timestamp).toLocaleString();
      
      this.log(`${status} ${chalk.cyan(entry.workflow)} - ${date}`);
      this.log(chalk.gray(`  Duration: ${(entry.duration / 1000).toFixed(2)}s`));
      
      if (!entry.success) {
        const failedStep = entry.steps.find((s) => !s.success);
        if (failedStep) {
          this.log(chalk.red(`  Failed at: ${failedStep.stepName}`));
          if (failedStep.error) {
            this.log(chalk.red(`  Error: ${failedStep.error}`));
          }
        }
      }
      
      this.log('');
    }
  }
}