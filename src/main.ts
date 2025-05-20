import newrelic from 'newrelic';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { NewrelicInterceptor } from './newrelic.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.useGlobalInterceptors(new NewrelicInterceptor());

  const config = new DocumentBuilder()
    .setTitle('StatsPro API')
    .setDescription('API para o projeto StatsPro')
    .setVersion('1.0')
    .addBearerAuth() // Se você estiver usando autenticação JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
