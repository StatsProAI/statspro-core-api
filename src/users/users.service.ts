import { Inject, Injectable } from '@nestjs/common';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { UserEntity } from '../bigquery/entities/UserEntity';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UserRepository')
    private readonly repository: BigQueryRepository<UserEntity>,
  ) {}

  async getAllUsers(): Promise<UserEntity[]> {
    return this.repository.findAll();
  }
}
