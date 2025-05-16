import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioClientProvider } from './twilio.provider';

@Module({
  controllers: [],
  providers: [TwilioService, TwilioClientProvider],
  exports: [TwilioClientProvider, TwilioService],
})
export class TwilioModule {}
