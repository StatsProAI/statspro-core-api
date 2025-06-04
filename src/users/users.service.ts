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

  async findUserById(userId: string): Promise<UserEntity> {
    return this.repository.findOne({
      userId,
    });
  }

  async findUserByPhoneNumber(phoneNumber: string): Promise<UserEntity> {
    return this.repository.findOne({
      phoneNumber,
    });
  }

  async updateCredits(userId: string, amountDiscontCredits: number) {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório.');
    }

    if (amountDiscontCredits <= 0) {
      throw new Error('O valor deve ser maior que zero.');
    }

    const user = await this.repository.findOne({
      userId,
    });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.credits < amountDiscontCredits) {
      throw new Error('Saldo insuficiente.');
    }

    const newCredits = user.credits - amountDiscontCredits;
    await this.repository.update(
      { userId },
      {
        credits: newCredits,
      },
    );
  }

  async findUserBySendMessageWhatsApp() {
    const dataSet = await this.repository.getDataSet();

    // const sql = `SELECT * FROM \`${dataSet}.user\` WHERE email in (
    //   'venturi@statspro.ai'
    // )`;
    // return this.repository.nativeQuery(sql);

    let users = [];

    const sqlActived = `SELECT * FROM \`${dataSet}.view_user_and_subs_enriched\` where status = 'ativo' AND phone_number is not null`;
    // const sqlTrial = `SELECT * FROM \`${dataSet}.view_user_and_subs_enriched\` where cadastrou_em > "2025-04-15" AND ja_assinou = false`;
    // const sqlChurn = `SELECT * FROM \`${dataSet}.view_user_and_subs_enriched\` where data_de_churn > "2025-05-05" AND credits = 0`;

    const usersActived = await this.repository.nativeQuery(sqlActived);
    // const usersTrial = await this.repository.nativeQuery(sqlTrial);
    // const usersChurn = await this.repository.nativeQuery(sqlChurn);
    // users = [...usersActived, ...usersTrial, ...usersChurn];

    users = [...usersActived];

    return users;
  }
}
