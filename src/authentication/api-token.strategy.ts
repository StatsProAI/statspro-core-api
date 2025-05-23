import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class ApiTokenStrategy extends PassportStrategy(Strategy, 'api-token') {
  constructor(
    private readonly configService: ConfigService,
    private userService: UsersService
  ) {
    super();
  }

  async validate(req: Request) {
    const apiToken = req.headers['x-api-token'] as string;
    const userId = req.headers['x-user-id'] as string;

    if (!apiToken || !userId) {
      throw new UnauthorizedException('Missing required headers');
    }

    // Validate API token against environment variable
    const validApiToken = this.configService.get('STATSPRO_CORE_API_KEY');
    if (apiToken !== validApiToken) {
      throw new UnauthorizedException('Invalid API token');
    }

    // Check if user exists in database
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
} 