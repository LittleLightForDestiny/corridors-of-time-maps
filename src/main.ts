import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
import {static as ExpressStatic} from 'express';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors:true});
  app.use('/', ExpressStatic('./public'));
  app.use('/map', ExpressStatic('./public'));
  app.use('/add-piece', ExpressStatic('./public'));
  app.use('/login', ExpressStatic('./public'));
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
