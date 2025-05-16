import { Injectable, Logger } from '@nestjs/common';
import { WhatsappTwilioSessionService } from '../whatsapp-twilio-session/whatsapp-twilio-session.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TwilioService } from '../twilio/twilio.service';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../bigquery/entities/UserEntity';

@Injectable()
export class WhatsappMessageService {

private readonly logger = new Logger(WhatsappMessageService.name);

  constructor(
    private readonly whatsappTwilioSessionService: WhatsappTwilioSessionService,
    private readonly twilioService: TwilioService,
    private readonly userService: UsersService
  ) {
  }


  async processGoLiveMessage() {
    const users: UserEntity[] = await this.userService.findUserBySendMessageWhatsApp();
    for (const user of users) {
      const { userId, firstName, phoneNumber } = user;
      await this.sendMessageGoLive(userId, firstName, phoneNumber);
    }
  }

  async sendMessageGoLive(userId: string, username: string, phoneNumber: string): Promise<any> {
    this.logger.log(`Sending WhatsApp message to ${username} (${phoneNumber})`);
    await this.whatsappTwilioSessionService.createSession(userId);
    await this.twilioService.sendWhatsAppMessage(username, phoneNumber);
  }
}
