import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { WhatsappMessageService } from './whatsapp-message.service';
import { Public } from '../authentication/decorators/public.decorator';

@Controller('whatsapp')
export class WhatsappMessageController {
  private readonly logger = new Logger(WhatsappMessageController.name);

  constructor(
    private readonly whatsappMessageService: WhatsappMessageService,
  ) {}

  @Get('send-first-message')
  @Public()
  async sendFirstMessage(): Promise<any> {
    return this.whatsappMessageService.processGoLiveMessage();
  }
}
