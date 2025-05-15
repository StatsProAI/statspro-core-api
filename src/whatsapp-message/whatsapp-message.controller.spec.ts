import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappMessageController } from './whatsapp-message.controller';
import { WhatsappMessageService } from './whatsapp-message.service';

describe('WhatsappMessageController', () => {
  let controller: WhatsappMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappMessageController],
      providers: [WhatsappMessageService],
    }).compile();

    controller = module.get<WhatsappMessageController>(
      WhatsappMessageController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
