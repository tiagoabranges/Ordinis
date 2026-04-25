import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, type AccountType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        institution: dto.institution,
        description: dto.description,
        currency: dto.currency ?? 'BRL',
        initialBalance: dto.initialBalance,
        creditLimit: dto.creditLimit,
        closingDay: dto.closingDay,
        dueDay: dto.dueDay,
      },
    });
  }

  async findAll(userId: string, type?: AccountType) {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    const balances = await this.getAccountBalances(userId);

    return accounts.map((account) => ({
      ...account,
      currentBalance:
        balances.get(account.id) ?? Number(account.initialBalance),
    }));
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findUnique({ where: { id } });
    this.assertOwnership(account, userId);
    return account;
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(userId, id);
    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.account.delete({ where: { id } });
    return { success: true };
  }

  async ensureOwned(userId: string, id: string) {
    const account = await this.prisma.account.findUnique({ where: { id } });
    this.assertOwnership(account, userId);
    return account;
  }

  private async getAccountBalances(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true, initialBalance: true },
    });

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: { in: ['PAID', 'PENDING', 'OVERDUE'] },
      },
      select: {
        accountId: true,
        destinationAccountId: true,
        amount: true,
        type: true,
      },
    });

    const balances = new Map<string, number>();
    for (const account of accounts) {
      balances.set(account.id, Number(account.initialBalance));
    }

    for (const transaction of transactions) {
      const amount = Number(transaction.amount);
      if (transaction.type === 'INCOME') {
        balances.set(
          transaction.accountId,
          (balances.get(transaction.accountId) ?? 0) + amount,
        );
      } else if (transaction.type === 'EXPENSE') {
        balances.set(
          transaction.accountId,
          (balances.get(transaction.accountId) ?? 0) - amount,
        );
      } else {
        balances.set(
          transaction.accountId,
          (balances.get(transaction.accountId) ?? 0) - amount,
        );
        if (transaction.destinationAccountId) {
          balances.set(
            transaction.destinationAccountId,
            (balances.get(transaction.destinationAccountId) ?? 0) + amount,
          );
        }
      }
    }

    return balances;
  }

  private assertOwnership(
    account: Prisma.AccountUncheckedCreateInput | { userId: string } | null,
    userId: string,
  ) {
    if (!account) {
      throw new NotFoundException('Conta não encontrada.');
    }

    if (account.userId !== userId) {
      throw new UnauthorizedException('Conta não pertence ao usuário.');
    }
  }
}
