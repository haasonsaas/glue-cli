import { Command, Args } from '@oclif/core';
import chalk from 'chalk';
import { AdapterManager } from '../core/adapter-manager.js';

export default class Auth extends Command {
  static description = 'Authenticate with an adapter';
  
  static examples = [
    '<%= config.bin %> <%= command.id %> slack',
    '<%= config.bin %> <%= command.id %> github',
  ];
  
  static args = {
    adapter: Args.string({
      description: 'Name of the adapter to authenticate',
      required: true,
    }),
  };
  
  async run(): Promise<void> {
    const { args } = await this.parse(Auth);
    
    try {
      const adapterManager = new AdapterManager();
      
      this.log(chalk.cyan(`Authenticating with ${args.adapter}...`));
      
      await adapterManager.authenticateAdapter(args.adapter);
      
      this.log(chalk.green(`✓ Successfully authenticated with ${args.adapter}`));
    } catch (error) {
      if (error instanceof Error) {
        this.error(chalk.red(error.message));
      }
      this.exit(1);
    }
  }
}