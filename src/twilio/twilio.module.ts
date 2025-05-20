import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioClientProvider } from './twilio.provider';
import { TwilioController } from './twilio.controller';
import { TwilioWebhookService } from './twilio-webhook.service';
import { WhatsappTwilioSessionModule } from '../whatsapp-twilio-session/whatsapp-twilio-session.module';
import { UsersModule } from '../users/users.module';
import { SportMonksModule } from '../sportmonks/sportmonks.module';

@Module({
  imports: [WhatsappTwilioSessionModule, UsersModule, SportMonksModule],
  controllers: [TwilioController],
  providers: [TwilioService, TwilioClientProvider, TwilioWebhookService],
  exports: [TwilioClientProvider, TwilioService],
})
export class TwilioModule {}
