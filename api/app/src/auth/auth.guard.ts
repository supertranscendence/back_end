import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardLocal implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const type = context.getType();
    console.log(type);
    let request;
    if (type == 'ws') request = context.switchToWs().getClient();
    else request = context.switchToHttp().getRequest();
    return this.validateRequest(request, type);
  }

  private async validateRequest(request: any, type: string) {
    this.auth.verifyToken(this.auth.extractToken(request, type));
    return true;
  }
}
