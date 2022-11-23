import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { Request } from "express";

@Injectable()
export class AuthGuardLocal implements CanActivate {
    constructor(private auth: AuthService) {
    }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        return this.validateRequest(request);
    }

    private async validateRequest(request: any) {
        const jwt = this.extractToken(request);

        request.auth = await this.auth.vf(jwt);
        return true
    }

    private extractToken(request: any): string {
        const token = request.headers.authorization;
        return token ? token.split('Bearer ')[1] : null;
    }
}