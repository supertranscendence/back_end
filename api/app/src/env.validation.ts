import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, validateSync, IsString } from 'class-validator';

enum Environment {
    Development = "dev",
    Production = "prod",
    Test = "test",
}

class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;
    @IsString()
    POSTGRES_HOST: string;
    @IsString()
    POSTGRES_DB: string;
    @IsNumber()
    DB_HOST_PORT: number;
    @IsString()
    POSTGRES_USER: string;
    @IsString()
    POSTGRES_PASSWORD: string;
    @IsString()
    JWT_SECRET: string;
    @IsString()
    AID: string;
    @IsString()
    APW: string;
    @IsString()
    URL: string;
    @IsString()
    FRONTEND_URL: string;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(
        EnvironmentVariables,
        config,
        { enableImplicitConversion: true },
    );
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}