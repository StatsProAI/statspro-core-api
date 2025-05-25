import { Injectable, Logger } from '@nestjs/common';
import { WhatsappTwilioSessionService } from '../whatsapp-twilio-session/whatsapp-twilio-session.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TwilioService } from '../twilio/twilio.service';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../bigquery/entities/UserEntity';
import { ONLY_USER_TEST } from '../common/constants';

@Injectable()
export class WhatsappMessageService {
  private readonly logger = new Logger(WhatsappMessageService.name);
  private readonly BATCH_SIZE = 5;

  constructor(
    private readonly whatsappTwilioSessionService: WhatsappTwilioSessionService,
    private readonly twilioService: TwilioService,
    private readonly userService: UsersService,
  ) {}

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async processGoLiveMessage() {
    const users: any[] = ONLY_USER_TEST;
    const userChunks = this.chunkArray(users, this.BATCH_SIZE);
    const totalUsers = users.length;
    let processedUsers = 0;
    let successCount = 0;
    let errorCount = 0;

    this.logger.log(
      `Starting to process ${totalUsers} users in batches of ${this.BATCH_SIZE}`,
    );

    for (const chunk of userChunks) {
      this.logger.log(
        `Processing batch of ${chunk.length} users (${processedUsers + 1} to ${processedUsers + chunk.length} of ${totalUsers})`,
      );

      await Promise.all(
        chunk.map(async (user) => {
          const { user_id, first_name, phone_number } = user;
          this.logger.log(
            `[${processedUsers + 1}/${totalUsers}] Processing user ${user_id} (${first_name}) with phone number ${phone_number}`,
          );
          try {
            await this.sendMessageGoLive(user_id, first_name, phone_number);
            this.logger.log(
              `[${processedUsers + 1}/${totalUsers}] Successfully processed user ${user_id}`,
            );
            successCount++;
          } catch (error) {
            this.logger.error(
              `[${processedUsers + 1}/${totalUsers}] Error processing user ${user_id}: ${error.message}`,
            );
            errorCount++;
          }
          processedUsers++;
        }),
      );

      this.logger.log(
        `Completed batch. Progress: ${processedUsers}/${totalUsers} users (${Math.round((processedUsers / totalUsers) * 100)}%)`,
      );
      // Add a small delay between batches to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    this.logger.log(`
=== Process Summary ===
Total users processed: ${totalUsers}
Successful operations: ${successCount}
Failed operations: ${errorCount}
Success rate: ${Math.round((successCount / totalUsers) * 100)}%
====================`);
  }

  async sendMessageGoLive(
    userId: string,
    username: string,
    phoneNumber: string,
  ): Promise<any> {
    this.logger.log(`Sending WhatsApp message to ${username} (${phoneNumber})`);
    //await this.whatsappTwilioSessionService.createSession(userId);
    await this.twilioService.sendMessageWithTemplate({
      contentSid: 'HX9eb436d91729de31b8b5580aaa619f73',
      phoneNumber
    });
  }

  private extractPhoneNumberFromPayload(payload: any): string | null {
    try {
      // Assuming the payload has a structure like { From: 'whatsapp:+5511999999999' }
      const from = payload.From;
      if (!from) return null;

      // Remove 'whatsapp:' prefix if present
      const phoneNumber = from.replace('whatsapp:', '');
      
      // Remove any non-numeric characters
      return phoneNumber.replace(/\D/g, '');
    } catch (error) {
      this.logger.error(`Error extracting phone number from payload: ${error.message}`);
      return null;
    }
  }


  async sendFirstMessageAfterSignUp(userId: string) {
    const user = await this.userService.findUserById(userId);
    await this.twilioService.sendWhatsAppMessageFirstMessageAfterSignUp(
      user.firstName,
      user.phoneNumber
    );
  }
}
