import {
  User,
  verifyToken,
  ClerkClient,
  createClerkClient,
} from '@clerk/backend';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { ClerkUserService } from './clerk-user.service';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  constructor(
    private readonly usersService: ClerkUserService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async validate(req: Request): Promise<User> {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      let decoded;
      const options = { algorithms: ['RS256'] };
      const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyJS9icRvn3DstUU6jDWm
IugXb4tjvfkwQ2YmupX1YesGxO11XFztTPhOGIPqief/D77YOUmF8nCZct2GHu30
rRua8qCn6WldGt7cLgC5nqfEO065Ixp49bUwUSQCgrPCTFr6YjvMlj+uGCddrh+h
fdL8bbvHGgWbYS1dE/wyLLO4f35CT0luqUwYszLTK2BRTyxL+k6elzZaPRBH+P2n
IZiqrhGeqh+2FGnMZoXPaaEMqKUUiTMUnLqMl4ExWZrPPjIpBNaNutOaqm1gJmq4
WFondii+kKgeRtdsHu75yW5iq8iJI7+JCAQCOmb3jxp07DiF6r+b5m/DmxK3PWxd
ZwIDAQAB
-----END PUBLIC KEY-----
`;


      decoded = jwt.verify(token, publicKey, options);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime || decoded.nbf > currentTime) {
        throw new Error('Token is expired or not yet valid');
      }
      const user = await this.usersService.getUser(decoded.sub);
      return user;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async decodeToken(token: string) {
    const [header, payload] = token.split('.');

    const decodedHeader = JSON.parse(
      Buffer.from(header, 'base64').toString('utf-8'),
    );
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8'),
    );

    return { header: decodedHeader, payload: decodedPayload };
  }
}
