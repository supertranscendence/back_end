
// import { EntityRepository, Repository } from "typeorm";
import { Friends } from "../../entities/Friends";

import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";


// @EntityRepository(Friends)
// export class FriendsRepository extends Repository<Friends> 
// {} 

// base repository > custom repository

@Injectable()
export class FriendsRepository extends Repository<Friends> {
    constructor(private readonly datasource: DataSource) {
        super(Friends, datasource.createEntityManager(), datasource.createQueryRunner());
    }

    // 비동기 처리를 위한 미래에 무언가 데이터가 올것이다! Promise
    async getById(id: number): Promise<Friends>{
        return await this.datasource.createEntityManager().findOneById(Friends, id)
    }
}

// datasource란 typeorm.config에서 설정을 해주었던 설정내용을 저장한 객체
// DataSource는 특정 데이터베이스에 대한 사전 정의된 연결 구성입니다.

// super란 parent에 접근 아래와 같은 인자를 넣어서 생성하는 부모 생성자 로 여기서는 Friendstype인 reposiroty

// createEntityManager을 만들어서 데이터베이스 연결이 필요할때 사용
// Creates an Entity Manager for the current connection with the help of the EntityManagerFactory.

// createQueryRunner
// 트랜잭션 > 로직의 한 사이클

// why service > repository
// test용이
// repository >> only data
// service >> only logic 으로 나누기 위함!

// write test file at FriendsApp