import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioClientProvider } from './twilio.provider';
import { TwilioController } from './twilio.controller';
import { TwilioWebhookService } from './twilio-webhook.service';
import { WhatsappTwilioSessionModule } from '../whatsapp-twilio-session/whatsapp-twilio-session.module';
import { UsersModule } from '../users/users.module';
import { SportMonksModule } from '../sportmonks/sportmonks.module';
import { HandleAnalisyStrategy } from './strategies/handle-analisy-strategy';
import { HandleListGamesStrategy } from './strategies/handle-list-games-strategy';
import { HandleDefaultStrategy } from './strategies/handle-default-strategy';
import { HandleSuporteStrategy } from './strategies/handle-suport-strategy';
import { QuestionCacheModule } from '../question-cache/question-cache.module';
import { QuestionModule } from '../question/question.module';
import { AuroraModule } from '../aurora/aurora.module';

@Module({
  imports: [
    WhatsappTwilioSessionModule,
    UsersModule,
    SportMonksModule,
    QuestionCacheModule,
    QuestionModule,
    AuroraModule,
  ],
  controllers: [TwilioController],
  providers: [
    TwilioService,
    TwilioClientProvider,
    TwilioWebhookService,
    HandleAnalisyStrategy,
    HandleListGamesStrategy,
    HandleDefaultStrategy,
    HandleSuporteStrategy,
  ],
  exports: [TwilioClientProvider, TwilioService],
})
export class TwilioModule {}
