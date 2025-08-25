import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PreUsersService } from './pre-users.service';
import { PreUserRepository } from '../mongo/repositories/pre-user.repository';
import { PreUser, PreUserSchema } from '../mongo/schemas/statspro-core-api/pre-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: PreUser.name, schema: PreUserSchema }],
      'CoreConnection', // Usa a nova conexão statspro_core
    ),
  ],
  providers: [PreUsersService, PreUserRepository],
  exports: [PreUsersService],
})
export class PreUsersModule {}
