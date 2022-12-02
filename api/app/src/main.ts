import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import {NestExpressApplication} from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors : true});

  const config = new DocumentBuilder()
      .setTitle('Super Transcendence')
      .setDescription('Don\'t panic')
      .setVersion('0.1')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);
  app.enableCors(
      {
        origin: 'https://gilee.click'
      }
  );
  app.use(cookieParser());
  app.set('trust proxy', '1');
  await app.listen(3000);
}
bootstrap();
