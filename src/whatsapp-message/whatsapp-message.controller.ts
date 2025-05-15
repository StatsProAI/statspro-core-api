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
    const to = '1234567890'; // Replace with the recipient's phone number
    const message = 'Hello, this is a test message!'; // Replace with your message
    return this.whatsappMessageService.sendFirstMessage(to, message);
  }
}
