import {CanActivate, ExecutionContext, Injectable, InternalServerErrorException} from "@nestjs/common";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";
import {Request} from "express";
import {Reflector} from "@nestjs/core";

@Injectable()
export class AuthGuardLocal implements CanActivate {
    constructor(private auth: AuthService, ) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        return this.validateRequest(request);
    }

    private async validateRequest(request: any) {
        const jwt = this.extractToken(request);

        this.auth.verifyToken(jwt);
        return true
    }

    private extractToken(request: any): string {
        // console.log(request.handshake.headers.authorization);
        //const token = request.handshake.headers.authorization; // handshake는 socket객체에 있는거..
        const token = request.headers.authorization;
        // console.log(token);
        return token ? token.split('Bearer ')[1] : null;
    }
}