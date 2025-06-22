import { spawn } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import type { 
  Workflow, 
  Step, 
  LocalStep, 
  AdapterStep, 
  WorkflowExecutionResult, 
  StepResult 
} from '../types/workflow.js';
import { AdapterManager } from './adapter-manager.js';
import { Logger } from '../utils/logger.js';

export class WorkflowEngine {
  constructor(
    private adapterManager: AdapterManager,
    private logger: Logger,
  ) {}

  async execute(workflow: Workflow): Promise<WorkflowExecutionResult> {
    const stepResults: StepResult[] = [];
    
    console.log(chalk.bold(`\n🚀 Starting workflow: ${workflow.when}\n`));
    
    for (const step of workflow.steps) {
      const startTime = Date.now();
      const spinner = ora(step.name).start();
      
      try {
        if (this.isLocalStep(step)) {
          await this.executeLocalStep(step);
        } else {
          await this.executeAdapterStep(step);
        }
        
        const duration = Date.now() - startTime;
        spinner.succeed(chalk.green(`✓ ${step.name}`));
        
        stepResults.push({
          stepName: step.name,
          success: true,
          duration,
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        spinner.fail(chalk.red(`✗ ${step.name}`));
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`  Error: ${errorMessage}`));
        
        stepResults.push({
          stepName: step.name,
          success: false,
          error: errorMessage,
          duration,
        });
        
        await this.logger.logExecution(workflow.when, stepResults);
        
        return {
          success: false,
          stepResults,
          error: errorMessage,
        };
      }
    }
    
    await this.logger.logExecution(workflow.when, stepResults);
    
    console.log(chalk.bold.green(`\n✅ Workflow completed successfully!\n`));
    
    return {
      success: true,
      stepResults,
    };
  }
  
  private isLocalStep(step: Step): step is LocalStep {
    return 'run' in step;
  }
  
  private async executeLocalStep(step: LocalStep): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(step.run, {
        shell: true,
        stdio: 'inherit',
      });
      
      child.on('error', reject);
      
      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command exited with code ${code}`));
        }
      });
    });
  }
  
  private async executeAdapterStep(step: AdapterStep): Promise<void> {
    const adapter = this.adapterManager.getAdapter(step.adapter);
    
    if (!adapter) {
      throw new Error(`Adapter "${step.adapter}" not found`);
    }
    
    const action = adapter.actions.get(step.action);
    
    if (!action) {
      throw new Error(`Action "${step.action}" not found in adapter "${step.adapter}"`);
    }
    
    await action.execute(step.options || {});
  }
}