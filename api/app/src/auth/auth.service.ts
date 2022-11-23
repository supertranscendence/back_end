import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthRepository } from "./auth.repository";

@Injectable()
export class AuthService {
    constructor(private authRepository : AuthRepository) {}

    async vf(token: string) {
        try {
            jwt.verify(token, process.env.JWT_SECRET); // 토큰 이슈가 없다면 그대로 return
        }catch (e) {
            console.log(e.message);
            if (e.message != 'jwt expired') // TODO: 만료된 토큰 이외의 경우는 따로 관리
                throw new jwt.JsonWebTokenError(e.message);
            const user = jwt.decode(token)['user'];
            const new_token = this.makeAccess(user);
            await this.authRepository.update({act: token},{act: new_token}).then(res => {
                console.log(res);
                if (!res.affected) // 가장 최근에 발행된 토큰이 아닌경우 걸린다. 만료와는 다른경우
                    throw new jwt.JsonWebTokenError('old jwt');
            });
            console.log("new token", new_token);
            token = new_token;
        }
        return token;
    }

    makeRefresh(intra: string): string{
        return jwt.sign({...{intra}}, process.env.JWT_SECRET, {
            expiresIn: '365d',
        });
    }

    makeAccess(intra: string): string{
        return jwt.sign({...{intra}}, process.env.JWT_SECRET, {
            expiresIn: '1h',
            //expiresIn: '20sec',
        });
    }

    async register(id: number, access: string, refresh: string) {
        const auth = await this.authRepository.findOneByOrFail({id: id}).catch(() => {return null;});
        if (!auth)
            return await this.authRepository.insertToken({id: id, act: access, res: refresh});
        return await this.authRepository.update(id, {act: access, res: refresh});
    }

    async findOneById(id: number) {
        return await this.authRepository.findById(id);
    }
}
