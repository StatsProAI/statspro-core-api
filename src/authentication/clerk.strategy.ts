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
import { JwksClient } from 'jwks-rsa';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  private client;
  constructor(
    private readonly usersService: ClerkUserService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.client = new JwksClient({
      jwksUri: 'https://clerk.statspro.ai/.well-known/jwks.json',
      cache: false
    });
  }

  async validate(req: Request): Promise<User> {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    console.log(`token: ${token}`);
    try {
      const decoded: any = await new Promise((resolve, reject) => {
        jwt.verify(
          token,
          (header, callback) => {
            console.log(`header: ${header}`);
            this.client.getSigningKey("ins_2nQn0yawVX8jetZuDvby49huoK1", (err, key) => {
              if (err) {
                callback(err, null);
              } else {
                console.log(`header.kid ${header.kid}`);
                const signingKey = key.getPublicKey();
                callback(null, signingKey);
              }
            });
          },
          { algorithms: ['RS256'] },
          (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
          },
        );
      });

      const user = await this.usersService.getUser(decoded.sub);
      return user;

      // let decoded;
      // const options = { algorithms: ['RS256'] };
      // const publicKey = process.env.CLERK_PUBLIC_KEY?.replace(/\\n/g, '\n');
      // decoded = jwt.verify(token, publicKey, options);
      // const currentTime = Math.floor(Date.now() / 1000);
      // if (decoded.exp < currentTime || decoded.nbf > currentTime) {
      //   throw new Error('Token is expired or not yet valid');
      // }
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
