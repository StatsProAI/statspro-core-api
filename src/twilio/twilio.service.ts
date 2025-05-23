import { Inject, Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { TwilioPayloadDto } from './dto/twilio-payload.dto';
import { UsersService } from 'src/users/users.service';
import { DEFAULT_MESSAGES } from './types/whatsapp';
import { twilioExtractPhoneNumber } from '../common/utils/twilio-extract-phone-number';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);

  constructor(
    @Inject('TWILIO_CLIENT') private readonly twilioClient: Twilio,
    private readonly usersService: UsersService,
  ) {}

  async sendTextWhatsAppMessage(body: any, phoneNumber: string) {
    const startTime = Date.now();
    try {
      this.logger.log(`📤 Sending WhatsApp text message to ${phoneNumber}`);
      await this.twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
        body,
      });
      const duration = Date.now() - startTime;
      this.logger.log(`✅ WhatsApp text message sent successfully to ${phoneNumber} in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Failed to send WhatsApp text message to ${phoneNumber} in ${duration}ms: ${error.message}`);
    }
  }

  async getLastMessage(from: string) {
    this.logger.log(`🔍 Fetching last message from ${from}`);
    const messages = await this.twilioClient.messages.list({
      to: `whatsapp:${from}`,
      limit: 50,
    });
    const filteredMessages = messages.filter(
      (message) =>
        message &&
        message.body !== '' &&
        message.body.includes('statspro-bot') &&
        message.direction === 'outbound-api',
    );

    const sortedMessages = filteredMessages.sort(
      (a, b) => new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime(),
    );

    this.logger.log(`📨 Found ${sortedMessages.length} messages for ${from}`);
    return sortedMessages[0];
  }

  async sendMenuWhatsAppMessage(
    userName: string,
    phoneNumber: string,
  ) {
    const startTime = Date.now();
    try {
      this.logger.log(`📤 Sending menu WhatsApp message to ${userName} (${phoneNumber})`);
      const message = await this.twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
        contentSid: process.env.TWILIO_CONTENT_SID_MENU,
        contentVariables: JSON.stringify({
          USERNAME: userName,
        }),
      });
      const duration = Date.now() - startTime;
      this.logger.log(`✅ Menu WhatsApp message sent successfully to ${userName} (${phoneNumber}) in ${duration}ms`);
      return message;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Failed to send menu WhatsApp message to ${userName} (${phoneNumber}) in ${duration}ms: ${error.message}`);
      throw new Error("Erro interno ao enviar mensagem twilio whatsapp");
    }
  }

  async sendWhatsAppMessage(
    username: string,
    phoneNumber: string,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.log(`📤 Sending WhatsApp message to ${username} (${phoneNumber})`);
      await this.twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
        contentSid: process.env.TWILIO_CONTENT_SID_GO_LIVE,
        messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
        contentVariables: JSON.stringify({
          '1': username,
        }),
      });
      const duration = Date.now() - startTime;
      this.logger.log(`✅ WhatsApp message sent successfully to ${username} (${phoneNumber}) in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Failed to send WhatsApp message to ${username} (${phoneNumber}) in ${duration}ms: ${error.message}`);
    }
  }

  async sendWhatsAppMessageListGames(
    listGames: any,
    phoneNumber: string,
  ): Promise<void> {
    const startTime = Date.now();
    try {
      this.logger.log(`📤 Sending games list WhatsApp message to ${phoneNumber}`);
      await this.twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
        contentSid: process.env.TWILIO_CONTENT_SID_LIST_GAMES,
        contentVariables: JSON.stringify({
          listGames,
        }),
      });
      const duration = Date.now() - startTime;
      this.logger.log(`✅ Games list WhatsApp message sent successfully to ${phoneNumber} in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Failed to send games list WhatsApp message to ${phoneNumber} in ${duration}ms: ${error.message}`);
    }
  }

  async sendWhatsAppMessageFirstMessageAfterSignUp(
    username: string,
    phoneNumber: string,
  ): Promise<void> {
    const startTime = Date.now();
    try {
      this.logger.log(`📤 Sending first message after sign up WhatsApp message to ${phoneNumber}`);
      await this.twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
        contentSid: process.env.TWILIO_CONTENT_SID_FIRST_MESSAGE_AFTER_SIGN_UP,
        contentVariables: JSON.stringify({
          '1': username,
        }),
      });
      const duration = Date.now() - startTime;
      this.logger.log(`✅ first message after sign up WhatsApp message sent successfully to ${phoneNumber} in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Failed to send first message after sign up WhatsApp message to ${phoneNumber} in ${duration}ms: ${error.message}`);
    }
  }
}
