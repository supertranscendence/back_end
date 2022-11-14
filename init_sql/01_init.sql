CREATE TABLE USERS
(
 "id"       serial NOT NULL,
 intra    varchar(20) NOT NULL,
 nickname varchar(20) NOT NULL,
 avatar   varchar(500) NOT NULL,
 lv    int NOT NULL,
 created  TIMESTAMP not null default now(),
 updated  TIMESTAMP,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" )
);


CREATE TABLE GAME
(
 "id"      serial NOT NULL,
 player  varchar(40) NOT NULL,
 score   varchar(7) NOT NULL,
 created  TIMESTAMP not null default now(),
 updated  TIMESTAMP,
 CONSTRAINT PK_GAME PRIMARY KEY ( "id" )
);


CREATE TABLE FRIENDS
(
 "id"      int NOT NULL,
 intra   varchar(20) NOT NULL,
 friend  varchar(20) NOT NULL,
 block   boolean NOT NULL,
 created  TIMESTAMP not null default now(),
 updated  TIMESTAMP,
 CONSTRAINT FK_FRIENDS FOREIGN KEY ( "id" ) REFERENCES USERS ( "id" )
);

CREATE INDEX FK_FRIENDS ON FRIENDS
(
 "id"
);

CREATE TABLE ACHIEVEMENTS
(
 "id"          int NOT NULL,
 achievement int NOT NULL,
 created  TIMESTAMP not null default now(),
 updated  TIMESTAMP,
 CONSTRAINT FK_2 FOREIGN KEY ( "id" ) REFERENCES USERS ( "id" )
);

CREATE INDEX FK_1 ON ACHIEVEMENTS
(
 "id"
);

CREATE TABLE pong.ACHIEVEMENTS_CODE
(
 code    serial NOT NULL,
 value   varchar(50) NOT NULL,
 created  TIMESTAMP not null default now(),
 updated  TIMESTAMP,
 CONSTRAINT PK_ACHIEVEMENTS_CODE PRIMARY KEY ( code )
);

CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS
$$
BEGIN
    OLD.updated = NOW();
    RETURN OLD;
END;
$$ LANGUAGE 'plpgsql'
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON users
    FOR EACH ROW
EXECUTE PROCEDURE set_updated_at()
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON achievements
    FOR EACH ROW
EXECUTE PROCEDURE set_updated_at()
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON achievements_code
    FOR EACH ROW
EXECUTE PROCEDURE set_updated_at()
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON friends
    FOR EACH ROW
EXECUTE PROCEDURE set_updated_at()
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON game
    FOR EACH ROW
EXECUTE PROCEDURE set_updated_at()
;
   
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE transcendence FROM PUBLIC;
