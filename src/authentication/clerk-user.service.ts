import { Inject, Injectable } from '@nestjs/common';

import { ClerkClient } from '@clerk/backend';
import { UserListParams } from './types/clerk-user.type';

@Injectable()
export class ClerkUserService {
  constructor(
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
  ) {}

  async getAllUsers(params: UserListParams) {
    return this.clerkClient.users.getUserList(params);
  }

  async getUser(userId: string) {
    return this.clerkClient.users.getUser(userId);
  }
}
