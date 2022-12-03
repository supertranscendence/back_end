import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  readonly JWT_SECRET;

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
        console.log(`revoked ${jwt.decode(res)['intra']}'s refresh token`);
      })
      .catch((e) => {
        console.log(intra + ' revoke failed');
        throw e;
      });
  }

  async refreshJWT(req: Request): Promise<any> {
    const res = this.extractToken(req);
    const act = this.makeAccess(jwt.decode(res)['intra']);
    await this.authRepository.update({ res: res }, { act: act });
    console.log(`refreshed ${jwt.decode(res)['intra']}'s access token: ${act}`);
    return { act };
  }

  extractToken(request: any): string {
    // console.log(request.handshake.headers.authorization);
    //const token = request.handshake.headers.authorization; // handshake는 socket객체에 있는거..
    const token = request.headers.authorization;
    return token ? token.split('Bearer ')[1] : null;
  }
}
