// src/twilio/twilio.controller.ts
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { TwilioPayloadDto } from './dto/twilio-payload.dto';
import { Public } from '../authentication/decorators/public.decorator';
import { TwilioService } from './twilio.service';
import { TwilioWebhookService } from './twilio-webhook.service';

@Controller('twilio')
export class TwilioController {

  constructor(
    private readonly twilioService: TwilioService,
    private readonly twilioWebhookService: TwilioWebhookService,
  ) {}

  @Public() 
  @Post('webhook')
  async handleWebhook(@Body() body: TwilioPayloadDto, @Res() res: Response) {
    try {
      await this.twilioWebhookService.processWebhook(body);
      return res.status(200).send('Webhook recebido com sucesso');
    } catch (error) {
      console.error('Erro ao processar o webhook:', error);
      return res.status(500).send('Erro interno no servidor');
    }
  }
}
