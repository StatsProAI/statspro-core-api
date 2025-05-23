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
    const users: UserEntity[] =
      await this.userService.findUserBySendMessageWhatsApp();
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
          const { userId, firstName, phoneNumber } = user;
          this.logger.log(
            `[${processedUsers + 1}/${totalUsers}] Processing user ${userId} (${firstName}) with phone number ${phoneNumber}`,
          );
          try {
            await this.sendMessageGoLive(userId, firstName, phoneNumber);
            this.logger.log(
              `[${processedUsers + 1}/${totalUsers}] Successfully processed user ${userId}`,
            );
            successCount++;
          } catch (error) {
            this.logger.error(
              `[${processedUsers + 1}/${totalUsers}] Error processing user ${userId}: ${error.message}`,
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    await this.whatsappTwilioSessionService.createSession(userId);
    await this.twilioService.sendWhatsAppMessage(username, phoneNumber);
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
