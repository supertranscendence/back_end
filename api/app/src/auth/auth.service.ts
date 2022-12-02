import {Injectable} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {AuthRepository} from "./auth.repository";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AuthService {
    readonly JWT_SECRET;

    constructor(private authRepository: AuthRepository,
                private config: ConfigService) {
        this.JWT_SECRET = this.config.get('JWT_SECRET');
    }

    verifyToken(token: string): void {
        jwt.verify(token, this.JWT_SECRET, (error) => {
            if (error)
                throw error;
        });
    }

    makeRefresh(intra: string): string {
        return jwt.sign({...{intra}}, this.JWT_SECRET, {
            expiresIn: '365d',
        });
    }

    makeAccess(intra: string): string {
        return jwt.sign({...{intra}}, this.JWT_SECRET, {
            expiresIn: '1h',
            //expiresIn: '20sec',
        });
    }

    async register(id: number, access: string, refresh: string) {
        const auth = await this.authRepository.findOneByOrFail({id: id}).catch(() => {
            return null;
        });
        if (!auth)
            return await this.authRepository.insertToken({id: id, act: access, res: refresh});
        return await this.authRepository.update(id, {act: access, res: refresh});
    }

    async findOneById(id: number) {
        return await this.authRepository.findById(id);
    }
}
