import { Catch, ExceptionFilter, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { HttpArgumentsHost, WsArgumentsHost } from '@nestjs/common/interfaces';
import { Client } from 'socket.io/dist/client';

@Catch(JsonWebTokenError)
export class JWTExceptionFilter implements ExceptionFilter {
  readonly host_url;

  constructor(private config: ConfigService) {
    this.host_url = this.config.get('HOST');
  }

  catch(exception: Error, host: ExecutionContext) {
    console.log('type: ', host.getType());
    const type = host.getType();
    let ctx: WsArgumentsHost | HttpArgumentsHost;
    let res, req;
    if (type == 'http') {
      ctx = host.switchToHttp();
      res = ctx.getResponse<Response>();
      req = ctx.getRequest<Request>();

      const base = `Bearer realm=${this.host_url}/api/auth/ft`;
      let handler = '/revoke';
      const response = (exception as JsonWebTokenError).message;

      if (
        req.url == '/api/auth/ft/refresh' ||
        req.url == '/api/auth/ft/revoke'
      ) {
        handler = '/redirect';
      } else if (response == 'jwt expired') {
        handler = '/refresh';
      }

      const log = {
        timestamp: new Date(),
        url: req.url,
        response,
        realm: base + handler,
      };

      console.log(log);

      res
        .status(401)
        .setHeader('WWW-Authenticate', base + handler)
        .json(response);
    } else {
      ctx = host.switchToWs();
      req = ctx.getData();
      res = ctx.getClient();
      res.emit('refresh', {}); //TODO: ws refresh, revoke 전략 필요 exception filter 나누기
    }
  }
}
