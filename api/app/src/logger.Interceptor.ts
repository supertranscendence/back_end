import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.logger.log(
      `socket event start ======> ${
        context.getHandler().name
      } intra : ${this.authService.getIntra(
        this.authService.extractToken(context.switchToWs().getClient(), 'ws'),
      )} id : ${context.switchToWs().getClient().id}`,
    );

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `socket event end   <====== ${
              context.getHandler().name
            } intra : ${this.authService.getIntra(
              this.authService.extractToken(
                context.switchToWs().getClient(),
                'ws',
              ),
            )} id : ${context.switchToWs().getClient().id} [${
              Date.now() - now
            }ms]`,
          ),
        ),
      );
  }
}
