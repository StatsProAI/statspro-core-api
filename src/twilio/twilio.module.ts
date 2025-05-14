import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { TwilioClientProvider } from './twilio.provider';

@Module({
  controllers: [TwilioController],
  providers: [TwilioService, TwilioClientProvider],
  exports: [TwilioClientProvider],
})
export class TwilioModule {}
