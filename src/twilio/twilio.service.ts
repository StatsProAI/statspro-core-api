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
    try {
      await this.twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
        body,
      });
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message ${error.message}`);
    }
  }

  async getLastMessage(from: string) {
    const messages = await this.twilioClient.messages.list({
      to: from,
      limit: 50,
    });
    const filteredMessages = messages.filter(
      (message) =>
        message &&
        message.body !== '' &&
        message.body.includes('statspro-bot') &&
        message.direction === 'outbound-api',
    );

    // Ordena do mais recente para o mais antigo
    const sortedMessages = filteredMessages.sort(
      (a, b) => new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime(),
    );

    // Pega a mensagem mais recente
    return sortedMessages[0];
  }

  async sendMenuWhatsAppMessage(
    userName: string,
    phoneNumber: string,
  ) {
    try {
      const message = await this.twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
        contentSid: process.env.TWILIO_CONTENT_SID_MENU, // seu template SID
        contentVariables: JSON.stringify({
          USERNAME: userName,
        }),
      });
      return message;
    } catch (error) {
      console.error("Erro ao enviar mensgem twilio whatsapp:", error);
      throw new Error("Erro interno ao enviar mensagem twilio whatsapp");
    }
  }

  async sendWhatsAppMessage(
    username: string,
    phoneNumber: string,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      await this.twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
        contentSid: process.env.TWILIO_CONTENT_SID_GO_LIVE, // seu template SID
        messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
        contentVariables: JSON.stringify({
          '1': username,
        }),
      });
      const duration = Date.now() - startTime;
      this.logger.log(
        `WhatsApp message sent to ${username} (${phoneNumber}) in ${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to send WhatsApp message to ${username} (${phoneNumber}) in ${duration}ms: ${error.message}`,
      );
    }
  }

  async sendWhatsAppMessageListGames(
    listGames: any,
    phoneNumber: string,
  ): Promise<void> {
    const startTime = Date.now();
    try {
      await this.twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
        contentSid: process.env.TWILIO_CONTENT_SID_LIST_GAMES, // seu template SID
        contentVariables: JSON.stringify({
          listGames,
        }),
      });
      const duration = Date.now() - startTime;
      this.logger.log(
        `WhatsApp message sent to (${phoneNumber}) in ${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to send WhatsApp message (${phoneNumber}) in ${duration}ms: ${error.message}`,
      );
    }
  }
}
