import * as cliProgress from 'cli-progress';
import { Logger } from './Logger';

export class ProgressTracker {
  private progressBar: cliProgress.SingleBar | null = null;
  private logger: Logger;
  private current = 0;
  private total = 0;
  private startTime: Date | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  start(total: number, label: string = 'Progress'): void {
    this.total = total;
    this.current = 0;
    this.startTime = new Date();

    this.progressBar = new cliProgress.SingleBar({
      format: `${label} | {bar} | {percentage}% | {value}/{total} | ETA: {eta}s | Elapsed: {duration}s`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    this.progressBar.start(total, 0);
    this.logger.info(`Started ${label}: 0/${total}`);
  }

  increment(step: number = 1): void {
    if (this.progressBar) {
      this.current += step;
      this.progressBar.update(this.current);
    }
  }

  finish(): void {
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = null;
    }

    if (this.startTime) {
      const elapsed = (Date.now() - this.startTime.getTime()) / 1000;
      this.logger.info(`Completed: ${this.current}/${this.total} items in ${elapsed.toFixed(1)}s`);
    }
  }

  updateLabel(label: string): void {
    if (this.progressBar) {
      // Create new progress bar with updated label
      const currentValue = this.current;
      this.progressBar.stop();
      
      this.progressBar = new cliProgress.SingleBar({
        format: `${label} | {bar} | {percentage}% | {value}/{total} | ETA: {eta}s | Elapsed: {duration}s`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });
      
      this.progressBar.start(this.total, currentValue);
    }
  }
}