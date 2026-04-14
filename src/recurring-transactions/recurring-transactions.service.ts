import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TransactionSource,
  TransactionStatus,
  type RecurringTransaction,
} from '@prisma/client';
import dayjs from 'dayjs';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { CostCentersService } from '../cost-centers/cost-centers.service';
import { addFrequency, toDate } from '../common/utils/date.util';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

@Injectable()
export class RecurringTransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
    private readonly costCentersService: CostCentersService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async create(userId: string, dto: CreateRecurringTransactionDto) {
    await this.accountsService.ensureOwned(userId, dto.accountId);
    await this.categoriesService.ensureOwned(userId, dto.categoryId);
    await this.costCentersService.ensureOwned(userId, dto.costCenterId);

    return this.prisma.recurringTransaction.create({
      data: {
        userId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        costCenterId: dto.costCenterId,
        type: dto.type,
        paymentMethod: dto.paymentMethod,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        frequency: dto.frequency,
        interval: dto.interval ?? 1,
        startDate: toDate(dto.startDate)!,
        endDate: toDate(dto.endDate),
        nextOccurrence: toDate(dto.startDate)!,
        notes: dto.notes,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.recurringTransaction.findMany({
      where: { userId },
      include: {
        account: true,
        category: true,
        costCenter: true,
      },
      orderBy: { nextOccurrence: 'asc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateRecurringTransactionDto) {
    await this.findOne(userId, id);

    return this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? toDate(dto.startDate) : undefined,
        endDate: dto.endDate ? toDate(dto.endDate) : undefined,
        nextOccurrence: dto.startDate ? toDate(dto.startDate) : undefined,
      },
    });
  }

  async terminate(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });
  }

  async generatePending(userId: string) {
    const series = await this.prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        nextOccurrence: { lte: new Date() },
      },
      orderBy: { nextOccurrence: 'asc' },
    });

    const generated: unknown[] = [];
    for (const item of series) {
      const transaction = await this.generateOccurrence(userId, item);
      generated.push(transaction);
    }

    return {
      generatedCount: generated.length,
      items: generated,
    };
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.recurringTransaction.findUnique({
      where: { id },
      include: {
        account: true,
        category: true,
        costCenter: true,
      },
    });

    if (!item || item.userId !== userId) {
      throw new NotFoundException('Recorrência não encontrada.');
    }

    return item;
  }

  private async generateOccurrence(userId: string, item: RecurringTransaction) {
    const transaction = await this.transactionsService.create(userId, {
      accountId: item.accountId,
      categoryId: item.categoryId ?? undefined,
      costCenterId: item.costCenterId ?? undefined,
      type: item.type,
      paymentMethod: item.paymentMethod,
      title: item.title,
      description: item.description ?? undefined,
      amount: Number(item.amount),
      transactionDate: item.nextOccurrence.toISOString(),
      dueDate: item.nextOccurrence.toISOString(),
      status: TransactionStatus.PENDING,
      notes: item.notes ?? undefined,
    });

    const nextOccurrence = addFrequency(
      dayjs(item.nextOccurrence),
      item.frequency,
      item.interval,
    ).toDate();

    await this.prisma.recurringTransaction.update({
      where: { id: item.id },
      data: {
        lastGeneratedAt: item.nextOccurrence,
        nextOccurrence,
        ...(item.endDate && nextOccurrence > item.endDate
          ? { isActive: false }
          : {}),
      },
    });

    return this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        recurringSeriesId: item.id,
        source: TransactionSource.AUTOMATION,
      },
    });
  }
}
