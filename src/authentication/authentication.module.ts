import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ClerkClientProvider } from './providers/clerk-client.provider';
import { ClerkUserService } from './clerk-user.service';
import { PassportModule } from '@nestjs/passport';
import { ClerkStrategy } from './clerk.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'clerk' }),
  ],
  providers: [
    AuthenticationService,
    ClerkClientProvider,
    ClerkUserService,
    ClerkStrategy,
  ],
  exports: [PassportModule],
})
export class AuthenticationModule {}
