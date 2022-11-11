import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Similarly, the export keyword lets you declare variables, functions, and classes that the module should be exposed to other scripts.

// 데이터베이스 테이블을 정의하기 전에 실행해야하는 데코레이터입니다.
// 테이블명을 따로 지정하지 않아도 클래스명으로 매핑하지만, 옵션으로 테이블명을 지정할 수 있습니다.
@Entity()
export class testapp {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100})
    name: string;

    @Column({default: false})
    completed: boolean;
}