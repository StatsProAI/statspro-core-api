import { Controller, Get, Logger, Post } from '@nestjs/common';
import { WhatsappMessageService } from './whatsapp-message.service';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import { Public } from '../authentication/decorators/public.decorator';


@Controller('whatsapp')
export class WhatsappMessageController {
  private readonly logger = new Logger(WhatsappMessageController.name);

  constructor(
    private readonly whatsappMessageService: WhatsappMessageService,
  ) {}

  @Public()
  @Post('send-batch')
  async sendBatch(): Promise<any> {
    return this.whatsappMessageService.processGoLiveMessage();
  }

  @Post('send-first-message')
  async sendFirstMessage(@CurrentUser() user: User): Promise<any> {
    return this.whatsappMessageService.sendFirstMessageAfterSignUp(user.id);
  }
}
