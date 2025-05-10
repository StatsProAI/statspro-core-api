import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Disponível globalmente sem precisar importar sempre
      envFilePath: ['.env'], // Carrega .env e .env.{NODE_ENV}
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
