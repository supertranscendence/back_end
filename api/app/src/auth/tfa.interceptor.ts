import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { UsersService } from '../users/services/users.service';
import { Users } from '../entities/Users';
import { MailerService } from '@nestjs-modules/mailer';
import * as uuid from 'uuid';

@Injectable()
export class TwoFactorInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger();

  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(UsersService) private readonly userService: UsersService,
    @Inject(MailerService) private readonly mailerService: MailerService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const intra = this.authService.getIntra(
      context.switchToHttp().getRequest().user.ac,
    );
    this.logger.log(`email auth start ======>`);
    const user: Users = await this.userService.findByIntra(intra);
    this.logger.log(user);
    if (user.tf == true && user.email && !user.verify_chk) {
      const code = uuid.v4();
      await this.mailerService
        .sendMail({
          from: 'noreply@gmail.com',
          to: user.email,
          subject: '당신은 합니다 인증 최고급의 온라인 핑퐁',
          html: `<p>Hi <b>${intra}</b> your secret code is <b>${code}</b></p>`,
        })
        .then(() =>
          this.logger.log(`<========== ${intra} send mail done ==========>`),
        )
        .catch((err) =>
          this.logger.error(
            `<========== ${intra} send mail failed : ${err.message}==========>`,
          ),
        );
      await this.userService.updateVerifyByIntra(intra, code);
      context.switchToHttp().getResponse().redirect('email');
      return of('');
    }
    await this.userService.updateVerifyChkByIntra(intra, null);
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(`email auth end   <====== [${Date.now() - now}ms]`),
        ),
      );
  }
}
