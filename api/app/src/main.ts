import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors : true});

  const config = new DocumentBuilder()
      .setTitle('Super Transcendence')
      .setDescription('Don\'t panic')
      .setVersion('0.1')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);
  app.enableCors();
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
