import {
    ArgumentsHost,
    Catch,
    ExceptionFilter, ExecutionContext,
} from '@nestjs/common';
import {Request, Response} from 'express';
import {JsonWebTokenError, verify, decode} from "jsonwebtoken";
import {AuthService} from "../auth/auth.service";
import {ConfigService} from "@nestjs/config";

@Catch(JsonWebTokenError)
export class JWTExceptionFilter implements ExceptionFilter {
    readonly host_url;
    constructor(private config: ConfigService) {
        this.host_url = this.config.get('HOST');
    }
    catch(exception: Error, host: ExecutionContext) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();
        let value: string = `Bearer realm=${this.host_url}/api/auth/ft`;
        let handler: string = '/revoke';
        const response = (exception as JsonWebTokenError).message;
//
        if (response == 'jwt expired') // TODO: 만료된 토큰 이외의 경우는 따로 관리
        {
            handler = '/refresh';
            // const user = decode(token)['user'];
            // const new_token = this.makeAccess(user);
            // await this.authRepository.update({act: token}, {act: new_token}).then(res => {
            //     console.log(res);
            //     if (!res.affected) // 가장 최근에 발행된 토큰이 아닌경우 걸린다. 만료와는 다른경우
            //         throw new jwt.JsonWebTokenError('old jwt');
            // });
            // console.log("new token", new_token);
            // token = new_token;
        }

        //
        const log = {
            timestamp: new Date(),
            url: req.url,
            response,
        }

        console.log(log);

        res
            .status(401)
            .setHeader('WWW-Authenticate', value + handler)
            .json(response);
    }
}