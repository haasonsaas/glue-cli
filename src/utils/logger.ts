import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import winston from 'winston';
import type { StepResult } from '../types/workflow.js';

export interface ExecutionLog {
  timestamp: string;
  workflow: string;
  success: boolean;
  duration: number;
  steps: StepResult[];
}

export class Logger {
  private historyPath: string;
  private logger: winston.Logger;
  
  constructor() {
    this.historyPath = path.join(os.homedir(), '.glue-history');
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ 
          filename: path.join(this.historyPath, 'glue.log'),
          maxsize: 5 * 1024 * 1024, // 5MB
          maxFiles: 5,
        }),
      ],
    });
  }
  
  async initialize(): Promise<void> {
    await fs.mkdir(this.historyPath, { recursive: true });
  }
  
  async logExecution(workflow: string, steps: StepResult[]): Promise<void> {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    const success = steps.every((step) => step.success);
    
    const log: ExecutionLog = {
      timestamp: new Date().toISOString(),
      workflow,
      success,
      duration: totalDuration,
      steps,
    };
    
    await this.initialize();
    
    // Save to JSON file for easy querying
    const logFile = path.join(
      this.historyPath,
      `${workflow}-${Date.now()}.json`
    );
    await fs.writeFile(logFile, JSON.stringify(log, null, 2));
    
    // Also log to winston
    this.logger.info('Workflow execution', log);
  }
  
  async getHistory(limit = 20): Promise<ExecutionLog[]> {
    await this.initialize();
    
    try {
      const files = await fs.readdir(this.historyPath);
      const jsonFiles = files
        .filter((f) => f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, limit);
      
      const logs: ExecutionLog[] = [];
      
      for (const file of jsonFiles) {
        try {
          const content = await fs.readFile(
            path.join(this.historyPath, file),
            'utf-8'
          );
          logs.push(JSON.parse(content) as ExecutionLog);
        } catch {
          // Skip invalid files
        }
      }
      
      return logs;
    } catch {
      return [];
    }
  }
  
  async clearHistory(): Promise<void> {
    await this.initialize();
    
    try {
      const files = await fs.readdir(this.historyPath);
      
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.log')) {
          await fs.unlink(path.join(this.historyPath, file));
        }
      }
    } catch {
      // Directory might not exist
    }
  }
}