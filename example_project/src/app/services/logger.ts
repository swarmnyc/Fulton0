import { BaseLoggerService } from 'fulton';

export class Logger extends BaseLoggerService {
    as() {
      return 'log';
    }

    transports() {
      return {
        console: {
          enabled: true,
          level: 'debug'
        }
      };
    }
}