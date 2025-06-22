import { Adapter, AdapterAction, AdapterOptions } from '../types/adapter.js';
import { AuthManager } from '../core/auth-manager.js';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

export abstract class BaseAdapter implements Adapter {
  abstract name: string;
  actions = new Map<string, AdapterAction>();
  protected authManager = new AuthManager();
  
  protected async prompt(question: string, hidden = false): Promise<string> {
    const rl = readline.createInterface({ input, output });
    
    if (hidden) {
      // Hide input for passwords
      output.write(question);
      const answer = await new Promise<string>((resolve) => {
        let buffer = '';
        
        const onData = (char: string) => {
          const code = char.charCodeAt(0);
          
          if (code === 3) {
            // Ctrl+C
            process.exit();
          } else if (code === 127 || code === 8) {
            // Backspace
            if (buffer.length > 0) {
              buffer = buffer.slice(0, -1);
              output.write('\\b \\b');
            }
          } else if (code === 13) {
            // Enter
            input.removeListener('data', onData);
            output.write('\\n');
            resolve(buffer);
          } else if (code >= 32) {
            // Printable character
            buffer += char;
            output.write('*');
          }
        };
        
        input.setRawMode(true);
        input.on('data', onData);
      });
      
      input.setRawMode(false);
      rl.close();
      return answer;
    } else {
      const answer = await rl.question(question);
      rl.close();
      return answer;
    }
  }
  
  protected registerAction(name: string, execute: (options: AdapterOptions) => Promise<void>): void {
    this.actions.set(name, { name, execute: execute.bind(this) });
  }
}