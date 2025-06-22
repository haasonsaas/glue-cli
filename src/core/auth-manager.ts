import * as keytar from 'keytar';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { createHash } from 'crypto';

const SERVICE_NAME = 'glue-cli';

export class AuthManager {
  private credentialsPath: string;
  
  constructor() {
    this.credentialsPath = path.join(os.homedir(), '.glue-auth');
  }
  
  async saveCredential(adapter: string, key: string, value: string): Promise<void> {
    try {
      // Try to use system keychain first
      await keytar.setPassword(SERVICE_NAME, `${adapter}_${key}`, value);
    } catch (error) {
      // Fallback to encrypted file storage
      await this.saveToFile(adapter, key, value);
    }
  }
  
  async getCredential(adapter: string, key: string): Promise<string | null> {
    try {
      // Try system keychain first
      const value = await keytar.getPassword(SERVICE_NAME, `${adapter}_${key}`);
      if (value) return value;
    } catch {
      // Ignore keytar errors
    }
    
    // Fallback to file storage
    return this.getFromFile(adapter, key);
  }
  
  async deleteCredential(adapter: string, key: string): Promise<void> {
    try {
      await keytar.deletePassword(SERVICE_NAME, `${adapter}_${key}`);
    } catch {
      // Ignore keytar errors
    }
    
    await this.deleteFromFile(adapter, key);
  }
  
  async listCredentials(adapter: string): Promise<string[]> {
    const keys: Set<string> = new Set();
    
    try {
      // Get from keytar
      const credentials = await keytar.findCredentials(SERVICE_NAME);
      for (const cred of credentials) {
        if (cred.account.startsWith(`${adapter}_`)) {
          keys.add(cred.account.replace(`${adapter}_`, ''));
        }
      }
    } catch {
      // Ignore keytar errors
    }
    
    // Get from file storage
    const fileKeys = await this.listFromFile(adapter);
    for (const key of fileKeys) {
      keys.add(key);
    }
    
    return Array.from(keys);
  }
  
  private async saveToFile(adapter: string, key: string, value: string): Promise<void> {
    await fs.mkdir(this.credentialsPath, { recursive: true });
    
    const fileName = this.getFileName(adapter, key);
    const filePath = path.join(this.credentialsPath, fileName);
    
    // Simple obfuscation (not secure encryption, but better than plaintext)
    const obfuscated = Buffer.from(value).toString('base64');
    
    await fs.writeFile(filePath, obfuscated, { mode: 0o600 });
  }
  
  private async getFromFile(adapter: string, key: string): Promise<string | null> {
    try {
      const fileName = this.getFileName(adapter, key);
      const filePath = path.join(this.credentialsPath, fileName);
      
      const obfuscated = await fs.readFile(filePath, 'utf-8');
      return Buffer.from(obfuscated, 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }
  
  private async deleteFromFile(adapter: string, key: string): Promise<void> {
    try {
      const fileName = this.getFileName(adapter, key);
      const filePath = path.join(this.credentialsPath, fileName);
      await fs.unlink(filePath);
    } catch {
      // File might not exist
    }
  }
  
  private async listFromFile(adapter: string): Promise<string[]> {
    try {
      const files = await fs.readdir(this.credentialsPath);
      const prefix = `${adapter}_`;
      const keys: string[] = [];
      
      for (const file of files) {
        if (file.startsWith(prefix)) {
          const key = file.replace(prefix, '').replace(/_.+$/, '');
          keys.push(key);
        }
      }
      
      return keys;
    } catch {
      return [];
    }
  }
  
  private getFileName(adapter: string, key: string): string {
    const hash = createHash('sha256')
      .update(`${adapter}_${key}`)
      .digest('hex')
      .substring(0, 8);
    return `${adapter}_${key}_${hash}`;
  }
}