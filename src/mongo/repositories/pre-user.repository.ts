import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PreUser,
  PreUserDocument,
} from '../schemas/statspro-core-api/pre-user.schema';

@Injectable()
export class PreUserRepository {
  constructor(
    @InjectModel(PreUser.name, 'CoreConnection') // Especifica a conexão CoreConnection
    private readonly preUserModel: Model<PreUserDocument>,
  ) {}

  async findByPhoneNumber(phoneNumber: string): Promise<PreUser | null> {
    return this.preUserModel.findOne({ phoneNumber }).exec();
  }

  async create(phoneNumber: string): Promise<PreUser> {
    const preUser = new this.preUserModel({
      phoneNumber,
      analysisCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return preUser.save();
  }

  async incrementAnalysisCount(phoneNumber: string): Promise<void> {
    await this.preUserModel.updateOne(
      { phoneNumber },
      {
        $inc: { analysisCount: 1 },
        updatedAt: new Date(),
      },
    );
  }

  async removeByPhoneNumber(phoneNumber: string): Promise<boolean> {
    const result = await this.preUserModel.deleteOne({ phoneNumber }).exec();
    return result.deletedCount > 0;
  }
}
