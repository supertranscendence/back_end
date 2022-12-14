CREATE SCHEMA pong AUTHORIZATION ts_dev;

CREATE TABLE pong.USERS
(
 "id"       serial NOT NULL,
 intra    varchar(20) NOT NULL,
 nickname varchar(20) NOT NULL,
 avatar   varchar(500),
 "level"    int NOT NULL,
 created  TIMESTAMP not null default now(),
 updated  TIMESTAMP,
 tf bool NULL DEFAULT false,
 email varchar(50) NULL,
 verify varchar(200) NULL,
 verify_chk varchar(200) NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( "id" )
);


CREATE TABLE pong.GAME
(
 "id"      serial NOT NULL,
 player  varchar(40) NOT NULL,
 score   varchar(7) NOT NULL,
 created  TIMESTAMP not null default now(),
 updated  TIMESTAMP,
 CONSTRAINT PK_GAME PRIMARY KEY ( "id" )
);


CREATE TABLE pong.FRIENDS
(
 "id"      int NOT NULL,
 tid serial4 NOT NULL,
 intra   varchar(20) NOT NULL,
 friend  varchar(20) NOT NULL,
 block   boolean NOT NULL,
 created  TIMESTAMP not null default now(),
 updated  TIMESTAMP,
 CONSTRAINT FK_FRIENDS FOREIGN KEY ( "id" ) REFERENCES pong.USERS ( "id" ),
 CONSTRAINT PK_FRIENDS PRIMARY KEY (tid)
);

CREATE INDEX FK_FRIENDS ON pong.FRIENDS
(
 "id"
);

CREATE TABLE pong.ACHIEVEMENTS
(
 "id"          int NOT NULL,
 tid serial4 NOT NULL,
 achievement int NOT NULL,
 created  TIMESTAMP not null default now(),
 updated  TIMESTAMP,
 CONSTRAINT FK_1 FOREIGN KEY ( "id" ) REFERENCES pong.USERS ( "id" ),
 CONSTRAINT PK_ACHIEVEMENTS PRIMARY KEY (tid)
);

CREATE INDEX FK_1 ON pong.ACHIEVEMENTS
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
CREATE TABLE pong.auth (
	id int4 null,
	aid serial4 NOT NULL,
	act varchar(500) NULL,
	res varchar(500) NULL,
	CONSTRAINT auth_pkey PRIMARY KEY (aid),
	CONSTRAINT FK_2 FOREIGN KEY (id) REFERENCES pong.users(id)
);
CREATE UNIQUE INDEX "FK_INDEX_AUTH" ON pong.auth USING btree (aid);

CREATE OR REPLACE FUNCTION pong.set_updated_at()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql'
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON pong.users
    FOR EACH ROW
EXECUTE PROCEDURE pong.set_updated_at()
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON pong.achievements
    FOR EACH ROW
EXECUTE PROCEDURE pong.set_updated_at()
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON pong.achievements_code
    FOR EACH ROW
EXECUTE PROCEDURE pong.set_updated_at()
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON pong.friends
    FOR EACH ROW
EXECUTE PROCEDURE pong.set_updated_at()
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON pong.game
    FOR EACH ROW
EXECUTE PROCEDURE pong.set_updated_at()
;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE ts_dev FROM PUBLIC;
