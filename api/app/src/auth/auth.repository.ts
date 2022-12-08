import { Auth } from '../entities/Auth';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AuthRepository extends Repository<Auth> {
  constructor(private readonly datasource: DataSource) {
    super(
      Auth,
      datasource.createEntityManager(),
      datasource.createQueryRunner(),
    );
  }

  async insertToken(auth: Auth) {
    console.log(auth);
    return await this.save(auth);
  }

  async findById(id: number) {
    return await this.datasource
      .createEntityManager()
      .findOneBy(Auth, { id: id });
  }
}
