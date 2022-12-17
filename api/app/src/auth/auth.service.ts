import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  readonly JWT_SECRET;
  private readonly logger: Logger = new Logger();

  constructor(
    private authRepository: AuthRepository,
    private config: ConfigService,
  ) {
    this.JWT_SECRET = this.config.get('JWT_SECRET');
  }

  verifyToken(token: string): void {
    jwt.verify(token, this.JWT_SECRET, (error) => {
      if (error) throw error;
    });
  }

  makeRefresh(intra: string): string {
    return jwt.sign({ ...{ intra } }, this.JWT_SECRET, {
      expiresIn: '365d',
    });
  }

  makeAccess(intra: string): string {
    return jwt.sign({ ...{ intra } }, this.JWT_SECRET, {
      expiresIn: '1h',
      //expiresIn: '20sec',
    });
  }

  async register(id: number, access: string, refresh: string) {
    const auth = await this.authRepository
      .findOneByOrFail({ id: id })
      .catch(() => {
        return null;
      });
    if (!auth)
      return await this.authRepository.insertToken({
        id: id,
        act: access,
        res: refresh,
      });
    return await this.authRepository.update(id, { act: access, res: refresh });
  }

  async findOneById(id: number) {
    return await this.authRepository.findOneByOrFail({ id: id });
  }

  async revokeJWT(req: Request): Promise<void> {
    const res = this.extractToken(req);
    const intra = jwt.decode(res)['intra'];
    await this.authRepository
      .delete({ res: res })
      .then((r) => {
        if (!r.affected) throw new InternalServerErrorException();
        this.logger.log(`revoked ${jwt.decode(res)['intra']}'s refresh token`);
      })
      .catch((e) => {
        this.logger.log(intra + ' revoke failed');
        throw e;
      });
  }

  async refreshJWT(req: Request): Promise<any> {
    const res = this.extractToken(req);
    const intra = jwt.decode(res)['intra'];
    const act = this.makeAccess(jwt.decode(res)['intra']);
    await this.authRepository
      .update({ res: res }, { act: act })
      .then((r) => {
        if (!r.affected) throw new InternalServerErrorException();
        this.logger.log(
          `refreshed ${jwt.decode(res)['intra']}'s access token: ${act}`,
        );
      })
      .catch((e) => {
        this.logger.log(intra + ' refresh failed');
        throw e;
      });
    return { act };
  }

  extractToken(request: any, reqType = 'http'): string {
    let token;
    if (reqType == 'http') {
      token = request.headers.authorization;
    } else if (reqType == 'ws') {
      token = request.handshake.auth.token;
      token = token ? token : request.handshake.headers.authorization;
    }
    return token ? token.split('Bearer ')[1] : null;
  }

  getIntra(token: string): string {
    try {
      this.verifyToken(token);
    } catch (e) {
      console.log(e);
      token = null;
    }
    return token ? jwt.decode(token)['intra'] : null;
  }
}
