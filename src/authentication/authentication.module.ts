import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ClerkClientProvider } from './providers/clerk-client.provider';
import { ClerkUserService } from './clerk-user.service';
import { PassportModule } from '@nestjs/passport';
import { ClerkStrategy } from './clerk.strategy';
import { ApiTokenStrategy } from './api-token.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'clerk' }),
    UsersModule,
  ],
  providers: [
    AuthenticationService,
    ClerkClientProvider,
    ClerkUserService,
    ClerkStrategy,
    ApiTokenStrategy,
  ],
  exports: [PassportModule],
})
export class AuthenticationModule {}
