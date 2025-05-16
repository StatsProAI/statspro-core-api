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


  async findUserBySendMessageWhatsApp() {
    const dataSet = await this.repository.getDataSet();
    const sql = `SELECT * FROM \`${dataSet}.user\` WHERE email in (
      'venturi@statspro.ai'
    )`;
    return this.repository.nativeQuery(sql);
  }
}
