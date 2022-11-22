import {Injectable, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {AuthRepository} from "./auth.repository";

@Injectable()
export class AuthService {
    constructor(
        private authRepository : AuthRepository,

    ) {}
    async verifyUser(token: string) {
        const user = await this.authRepository.findOneBy({
            act: token
        });
        if (!user)
            throw new jwt.JsonWebTokenError("User Not Exist");
        return this.login(user.act);
    }

    login(user: string) {
    }

    vf(token: string) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
        }catch (e) {
            console.log(e.message);
            if (e.message == 'invalid signature')
                throw UnauthorizedException;
            console.error("expired");
            console.log("token:", jwt.decode(token)['user']);
            const user = jwt.decode(token)['user'];
            token = jwt.sign({...{user}}, process.env.JWT_SECRET, {
                expiresIn: '20sec',
            })
            console.log("new token", token);
        }
        return jwt.verify(token, process.env.JWT_SECRET)
    }

    makeRefresh(intra: string): string{
        intra += "_refresh";
        return jwt.sign({...{intra}}, process.env.JWT_SECRET, {
            expiresIn: '365d',
        });
    }

    makeAccess(intra: string): string{
        return jwt.sign({...{intra}}, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
    }

    async register(id: number, access: string, refresh: string) {
        return await this.authRepository.insertToken({id: id, act: access, res: refresh});
    }

    async findOneById(id: number) {
        return await this.authRepository.findById(id);
    }
}
