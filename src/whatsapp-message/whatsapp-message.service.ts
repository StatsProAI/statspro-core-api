import { Injectable } from '@nestjs/common';
import { WhatsappTwilioSessionService } from '../whatsapp-twilio-session/whatsapp-twilio-session.service';

@Injectable()
export class WhatsappMessageService {
  constructor(
    private readonly whatsappTwilioSessionService: WhatsappTwilioSessionService,
  ) {
    // Initialize any dependencies if needed
  }

  async sendFirstMessage(to: string, message: string): Promise<any> {
    await this.whatsappTwilioSessionService.createSession();
    // Simulate sending a message
    console.log(`Sending message to ${to}: ${message}`);
    return { status: 'success', message: 'Message sent successfully' };
  }
}
