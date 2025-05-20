import { Injectable } from "@nestjs/common";
import { TwilioService } from "../twilio.service";

@Injectable()
export class HandleAnalisyStrategy {

    constructor(
        private readonly twilioService: TwilioService,
    ) {}

    async execute(userId: string, from: string, text: string) {
        const lastMessage = await this.twilioService.getLastMessage(from);
    }
}