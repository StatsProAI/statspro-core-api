import { Module } from '@nestjs/common';
import { WhatsappMessageService } from './whatsapp-message.service';
import { WhatsappMessageController } from './whatsapp-message.controller';
import { WhatsappTwilioSessionModule } from '../whatsapp-twilio-session/whatsapp-twilio-session.module';

@Module({
  imports: [WhatsappTwilioSessionModule],
  controllers: [WhatsappMessageController],
  providers: [WhatsappMessageService],
})
export class WhatsappMessageModule {}
