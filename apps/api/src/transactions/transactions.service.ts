import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  TransactionSource,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import dayjs from 'dayjs';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { CostCentersService } from '../cost-centers/cost-centers.service';
import { toDate } from '../common/utils/date.util';
import { sha256 } from '../common/utils/hash.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MarkTransactionPaidDto } from './dto/mark-transaction-paid.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
    private readonly costCentersService: CostCentersService,
  ) {}

  async create(userId: string, dto: CreateTransactionDto) {
    await this.validateReferences(userId, dto);

    if (dto.type === TransactionType.TRANSFER) {
      if (
        !dto.destinationAccountId ||
        dto.destinationAccountId === dto.accountId
      ) {
        throw new BadRequestException(
          'Transferência requer conta de destino válida.',
        );
      }
    }

    return this.prisma.transaction.create({
      data: {
        userId,
        accountId: dto.accountId,
        destinationAccountId: dto.destinationAccountId,
        categoryId: dto.categoryId,
        costCenterId: dto.costCenterId,
        type: dto.type,
        paymentMethod: dto.paymentMethod,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        transactionDate: toDate(dto.transactionDate)!,
        dueDate: toDate(dto.dueDate),
        status: dto.status ?? TransactionStatus.PENDING,
        notes: dto.notes,
        externalHash: sha256(
          `${userId}:${dto.accountId}:${dto.title}:${dto.amount}:${dto.transactionDate}`,
        ),
      },
    });
  }

  async findAll(userId: string, query: QueryTransactionsDto) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
      ...(query.accountId ? { accountId: query.accountId } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.costCenterId ? { costCenterId: query.costCenterId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              { notes: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.startDate || query.endDate
        ? {
            transactionDate: {
              ...(query.startDate ? { gte: toDate(query.startDate) } : {}),
              ...(query.endDate ? { lte: toDate(query.endDate) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        include: {
          account: true,
          destinationAccount: true,
          category: true,
          costCenter: true,
          installmentGroup: true,
          recurringSeries: true,
          attachments: true,
        },
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        account: true,
        destinationAccount: true,
        category: true,
        costCenter: true,
        installmentGroup: true,
        recurringSeries: true,
        attachments: true,
      },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundException('Transação não encontrada.');
    }

    return transaction;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOne(userId, id);
    await this.validateReferences(userId, dto);

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        transactionDate: dto.transactionDate
          ? toDate(dto.transactionDate)
          : undefined,
        dueDate: dto.dueDate ? toDate(dto.dueDate) : undefined,
      },
    });
  }

  async markPaid(userId: string, id: string, dto: MarkTransactionPaidDto) {
    await this.findOne(userId, id);

    return this.prisma.transaction.update({
      where: { id },
      data: {
        status: TransactionStatus.PAID,
        transactionDate: toDate(dto.paidAt) ?? new Date(),
      },
    });
  }

  async cancel(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.transaction.update({
      where: { id },
      data: {
        status: TransactionStatus.CANCELED,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.cancel(userId, id);
    return { success: true };
  }

  async createInstallments(
    userId: string,
    data: CreateTransactionDto & {
      totalInstallments: number;
      firstDueDate: string;
    },
  ) {
    if (data.type !== TransactionType.EXPENSE) {
      throw new BadRequestException(
        'Parcelamento é suportado apenas para despesas.',
      );
    }

    await this.validateReferences(userId, data);
    const totalAmount = data.amount;
    const installmentAmount = Number(
      (totalAmount / data.totalInstallments).toFixed(2),
    );
    const amounts = Array.from(
      { length: data.totalInstallments },
      () => installmentAmount,
    );
    const diff = Number(
      (totalAmount - amounts.reduce((sum, amount) => sum + amount, 0)).toFixed(
        2,
      ),
    );
    amounts[amounts.length - 1] = Number(
      (amounts[amounts.length - 1] + diff).toFixed(2),
    );

    const firstDueDate = dayjs(data.firstDueDate);
    const created = await this.prisma.$transaction(async (tx) => {
      const group = await tx.installmentGroup.create({
        data: {
          userId,
          title: data.title,
          description: data.description,
          totalAmount,
          totalInstallments: data.totalInstallments,
        },
      });

      const transactions = await Promise.all(
        amounts.map((amount, index) =>
          tx.transaction.create({
            data: {
              userId,
              accountId: data.accountId,
              categoryId: data.categoryId,
              costCenterId: data.costCenterId,
              type: TransactionType.EXPENSE,
              paymentMethod: data.paymentMethod,
              title: `${data.title} ${index + 1}/${data.totalInstallments}`,
              description: data.description,
              amount,
              transactionDate: firstDueDate.add(index, 'month').toDate(),
              dueDate: firstDueDate.add(index, 'month').toDate(),
              status: data.status ?? TransactionStatus.PENDING,
              installmentGroupId: group.id,
              installmentNumber: index + 1,
              totalInstallments: data.totalInstallments,
              source: TransactionSource.MANUAL,
              notes: data.notes,
            },
          }),
        ),
      );

      return { group, transactions };
    });

    return created;
  }

  async createFromImport(
    userId: string,
    items: Array<{
      accountId: string;
      categoryId?: string | null;
      costCenterId?: string | null;
      type: TransactionType;
      paymentMethod: Prisma.TransactionCreateInput['paymentMethod'];
      title: string;
      description?: string;
      amount: number;
      transactionDate: Date;
      source: TransactionSource;
      rawInput: Prisma.InputJsonValue;
      externalHash: string;
    }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      let imported = 0;
      let duplicates = 0;

      for (const item of items) {
        const existing = await tx.transaction.findFirst({
          where: {
            userId,
            externalHash: item.externalHash,
          },
        });

        if (existing) {
          duplicates += 1;
          continue;
        }

        await tx.transaction.create({
          data: {
            userId,
            accountId: item.accountId,
            categoryId: item.categoryId ?? undefined,
            costCenterId: item.costCenterId ?? undefined,
            type: item.type,
            paymentMethod: item.paymentMethod,
            title: item.title,
            description: item.description,
            amount: item.amount,
            transactionDate: item.transactionDate,
            status: TransactionStatus.PAID,
            source: item.source,
            rawInput: item.rawInput,
            externalHash: item.externalHash,
          },
        });
        imported += 1;
      }

      return { imported, duplicates };
    });
  }

  private async validateReferences(
    userId: string,
    dto: Partial<CreateTransactionDto>,
  ) {
    if (dto.accountId) {
      await this.accountsService.ensureOwned(userId, dto.accountId);
    }

    if (dto.destinationAccountId) {
      await this.accountsService.ensureOwned(userId, dto.destinationAccountId);
    }

    if (dto.categoryId) {
      await this.categoriesService.ensureOwned(userId, dto.categoryId);
    }

    if (dto.costCenterId) {
      await this.costCentersService.ensureOwned(userId, dto.costCenterId);
    }
  }
}
