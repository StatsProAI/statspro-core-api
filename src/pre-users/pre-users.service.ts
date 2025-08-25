import { Injectable } from '@nestjs/common';
import { PreUserRepository } from '../mongo/repositories/pre-user.repository';
import { PreUser } from '../mongo/schemas/statspro-core-api/pre-user.schema';

@Injectable()
export class PreUsersService {
  constructor(private readonly preUserRepository: PreUserRepository) {}

  async findByPhoneNumber(phoneNumber: string): Promise<PreUser | null> {
    return this.preUserRepository.findByPhoneNumber(phoneNumber);
  }

  async create(phoneNumber: string): Promise<void> {
    await this.preUserRepository.create(phoneNumber);
  }

  async incrementAnalysisCount(phoneNumber: string): Promise<void> {
    await this.preUserRepository.incrementAnalysisCount(phoneNumber);
  }

  async removeByPhoneNumber(phoneNumber: string): Promise<boolean> {
    return this.preUserRepository.removeByPhoneNumber(phoneNumber);
  }
}
