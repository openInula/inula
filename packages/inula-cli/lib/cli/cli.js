var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chalk from 'chalk';
import yargsParser from 'yargs-parser';
import Hub from '../core/Hub.js';
import initializeEnv from '../utils/initializeEnv.js';
import { Logger, LogLevel } from '../utils/logger.js';
export default function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = yargsParser(process.argv.slice(2));
        const alias = {
            h: 'help',
            v: 'version',
            g: 'generate',
        };
        let command = args._[0];
        if (!command) {
            if (args['v'] || args['version']) {
                command = 'v';
            }
            if (args['h'] || args['help']) {
                command = 'h';
            }
        }
        const aliasCommand = alias[command];
        if (aliasCommand) {
            command = aliasCommand;
        }
        initializeEnv();
        if (command === 'version' || command === 'help') {
            process.env.INNER_COMMAND = "true";
        }
        switch (command) {
            case 'build':
                process.env.NODE_ENV = 'production';
                break;
            case 'dev':
                process.env.NODE_ENV = 'development';
                break;
            default:
                process.env.NODE_ENV = 'development';
                break;
        }
        let enableDebug = false;
        if (process.env.DEBUG === "true") {
            enableDebug = true;
        }
        const logger = new Logger(enableDebug ? LogLevel.DEBUG : LogLevel.INFO);
        try {
            new Hub({
                logger: logger,
            }).run({
                command,
                args,
            });
        }
        catch (err) {
            if (err instanceof Error) {
                logger.error(chalk.red(err.message));
                if (err.stack) {
                    logger.error(err.stack);
                }
                process.exit(1);
            }
        }
    });
}
