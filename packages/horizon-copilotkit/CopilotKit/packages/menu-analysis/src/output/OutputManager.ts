import * as fs from 'fs-extra';
import * as path from 'path';
import { MenuFunctionality, OutputConfig } from '../types';
import { Logger } from '../utils/Logger';

export class OutputManager {
  private config: OutputConfig;
  private logger: Logger;

  constructor(config: OutputConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  async saveResults(functionalities: MenuFunctionality[]): Promise<void> {
    // Ensure output directory exists
    await fs.ensureDir(path.dirname(this.config.outputPath));

    // Only support JSON format
    await this.saveAsJson(functionalities);
    this.logger.info(`Results saved to: ${this.config.outputPath}`);
  }

  private async saveAsJson(functionalities: MenuFunctionality[]): Promise<void> {
    const outputPath = this.ensureExtension(this.config.outputPath, '.json');
    
    const output = {
      metadata: {
        timestamp: new Date().toISOString(),
        totalMenus: functionalities.length,
        version: '1.0.0'
      },
      functionalities
    };

    await fs.writeJson(outputPath, output, { spaces: 2 });
  }

  private ensureExtension(filePath: string, extension: string): string {
    if (!filePath.endsWith(extension)) {
      return filePath + extension;
    }
    return filePath;
  }

  async saveProgressReport(processed: number, total: number, currentMenu?: string): Promise<void> {
    const reportPath = path.join(path.dirname(this.config.outputPath), 'progress.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      processed,
      total,
      percentage: Math.round((processed / total) * 100),
      currentMenu,
      status: processed < total ? 'running' : 'completed'
    };

    await fs.writeJson(reportPath, report, { spaces: 2 });
  }
}