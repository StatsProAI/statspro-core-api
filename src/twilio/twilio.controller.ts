// src/twilio/twilio.controller.ts
import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { TwilioPayloadDto } from './dto/twilio-payload.dto';
import { Public } from '../authentication/decorators/public.decorator';
import { TwilioWebhookService } from './twilio-webhook.service';

@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioWebhookService: TwilioWebhookService) {}

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() body: TwilioPayloadDto, @Res() res: Response) {
    const startTime = Date.now();
    console.log('🚀 ===== WEBHOOK RECEBIDO =====');
    console.log(`📥 From: ${body.From} | Body: "${body.Body}"`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    try {
      await this.twilioWebhookService.processWebhook(body);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Webhook processado com sucesso em ${duration}ms`);
      console.log('🏁 ===== WEBHOOK FINALIZADO =====');
      
      return res.status(200).send('Webhook recebido com sucesso');
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Erro ao processar webhook em ${duration}ms:`, error);
      console.log('🏁 ===== WEBHOOK COM ERRO =====');
      
      return res.status(500).send('Erro interno no servidor');
    }
  }
}
