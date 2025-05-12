import { ClerkClient } from '@clerk/backend';

export type UserListParams = Parameters<ClerkClient['users']['getUserList']>[0];
