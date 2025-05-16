import { Module } from '@nestjs/common';
import { WhatsappMessageService } from './whatsapp-message.service';
import { WhatsappMessageController } from './whatsapp-message.controller';
import { WhatsappTwilioSessionModule } from '../whatsapp-twilio-session/whatsapp-twilio-session.module';
import { TwilioModule } from '../twilio/twilio.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [WhatsappTwilioSessionModule, TwilioModule, UsersModule],
  controllers: [WhatsappMessageController],
  providers: [WhatsappMessageService],
})
export class WhatsappMessageModule {}
