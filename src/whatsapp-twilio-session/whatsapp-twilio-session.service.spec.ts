import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappTwilioSessionService } from './whatsapp-twilio-session.service';

describe('WhatsappTwilioSessionService', () => {
  let service: WhatsappTwilioSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsappTwilioSessionService],
    }).compile();

    service = module.get<WhatsappTwilioSessionService>(
      WhatsappTwilioSessionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
