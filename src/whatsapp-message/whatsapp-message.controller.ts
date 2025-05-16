import { Controller, Get } from '@nestjs/common';
import { WhatsappMessageService } from './whatsapp-message.service';
import { Public } from '../authentication/decorators/public.decorator';

@Controller('whatsapp-message')
export class WhatsappMessageController {
  constructor(
    private readonly whatsappMessageService: WhatsappMessageService,
  ) {}

  @Get('send-first-message')
  @Public()
  async sendFirstMessage(): Promise<any> {
    return this.whatsappMessageService.processGoLiveMessage();
  }
}
