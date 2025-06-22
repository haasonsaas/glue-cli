import { Command } from '@oclif/core';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';

const EXAMPLE_CONFIG = `# Example Glue workflow configuration

# Workflow triggered on deployment
deploy:
  when: deploy
  steps:
    - name: "Run tests"
      run: "npm test"
    
    - name: "Build application"
      run: "npm run build"
    
    # Example adapter usage (uncomment and configure)
    # - name: "Notify team"
    #   adapter: slack
    #   action: notify
    #   options:
    #     channel: "#deployments"
    #     message: "Deployment completed successfully"

# Workflow for CI failures
ci-fail:
  when: ci-fail
  steps:
    - name: "Get error logs"
      run: "tail -n 50 error.log"
    
    # - name: "Create bug ticket"
    #   adapter: linear
    #   action: create_issue
    #   options:
    #     team: "Backend"
    #     title: "CI Build Failure"
    #     priority: "Urgent"
`;

export default class Init extends Command {
  static description = 'Initialize a new glue.yaml file';
  
  static examples = ['<%= config.bin %> <%= command.id %>'];
  
  async run(): Promise<void> {
    const configPath = path.join(process.cwd(), 'glue.yaml');
    
    try {
      // Check if file already exists
      await fs.access(configPath);
      this.log(chalk.yellow('glue.yaml already exists in this directory'));
      this.exit(1);
    } catch {
      // File doesn't exist, create it
      await fs.writeFile(configPath, EXAMPLE_CONFIG);
      this.log(chalk.green('✓ Created glue.yaml'));
      this.log('');
      this.log('Next steps:');
      this.log('  1. Edit glue.yaml to define your workflows');
      this.log('  2. Run a workflow with: glue run <workflow-name>');
      this.log('');
      this.log('Example: glue run deploy');
    }
  }
}