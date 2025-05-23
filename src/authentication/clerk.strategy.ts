import { User, verifyToken } from '@clerk/backend';
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

    const [header, payload] = token.split('.');

    const decodedHeader = JSON.parse(
      Buffer.from(header, 'base64').toString('utf-8'),
    );
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8'),
    );

    console.log(decodedHeader);
    console.log(decodedPayload);

    try {
      const tokenPayload = await verifyToken(token, {
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
        jwtKey: `
          -----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6FFJn7T9ZSQNUNFVhPgc
0vmwF7u3vhmS932hZe6D92DaNkSBPjqXr1h0iK/U5x398jMwiKwIE/MMQKhG5Wfg
XeRCcaHy4dsKThgioe2JmruXaqRgHT0AXSxrt/T4+Km44Sl84sbs4r3mW+rQdqM4
LhgEc/xKlsjGoQ8G2I9kaGJ4RPwK0TV7Byjrz0Us3vcLl6SthBpiZpx39dDND2ON
7752CBkUECfQ2WBvZ9ucdvAHYbAuuOX1OrXz73MscoQqCASyaPeplChIjOCly7yA
R83sbSMTTfluVcv07X1UyjyIba4dR6zax4K1tdTO4EMeTO3iHdtFNcnPe0CpgeyP
cwIDAQAB
-----END PUBLIC KEY-----
        `,
        skipJwksCache: true,
      });

      const user = await this.usersService.getUser(tokenPayload.sub);

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
