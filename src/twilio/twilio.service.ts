import { Inject, Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  constructor(@Inject('TWILIO_CLIENT') private readonly twilioClient: Twilio) {}

  async sendWhatsAppMessage(
    username: string,
    phoneNumber: string,
  ): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: phoneNumber,
        contentSid: process.env.TWILIO_CONTENT_SID_GO_LIVE, // seu template SID
        messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
        contentVariables: JSON.stringify({
          '1': username,
        }),
      });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new Error('Failed to send WhatsApp message');
    }
  }
}
