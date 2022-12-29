import {
  Catch,
  ExceptionFilter,
  ExecutionContext,
  Logger,
} from '@nestjs/common';

@Catch()
export class GlobalFilter implements ExceptionFilter {
  private readonly logger;

  constructor() {
    this.logger = new Logger();
  }

  catch(exception: Error, host: ExecutionContext) {
    this.logger.error(
      `${exception.name}: ${exception.message} : ${
        host.switchToHttp().getRequest().url
      }`,
    );
    switch (host.getType()) {
      case 'http':
        host.switchToHttp().getResponse().status(500).json('Internal Error');
        break;
      case 'ws':
        host.switchToWs().getClient().emit('error', {});
        break;
    }
  }
}
