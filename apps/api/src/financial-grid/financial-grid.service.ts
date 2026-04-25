import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import dayjs from 'dayjs';
import { toDate } from '../common/utils/date.util';
import { PrismaService } from '../prisma/prisma.service';
import { QueryFinancialGridDto } from './dto/query-financial-grid.dto';

type FinancialGridTransaction = Transaction & {
  account: {
    id: string;
    name: string;
    type: string;
  };
  destinationAccount: {
    id: string;
    name: string;
    type: string;
  } | null;
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  costCenter: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  installmentGroup: {
    id: string;
    title: string;
    totalAmount: Prisma.Decimal;
    totalInstallments: number;
  } | null;
};

@Injectable()
export class FinancialGridService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryFinancialGridDto) {
    const where = this.buildWhere(userId, query);
    const topLevelWhere: Prisma.TransactionWhereInput = {
      AND: [
        where,
        {
          OR: [
            { installmentGroupId: null },
            { installmentNumber: 1 },
            { installmentNumber: null },
          ],
        },
      ],
    };

    const [items, total, summary] = await Promise.all([
      this.prisma.transaction.findMany({
        where: topLevelWhere,
        include: this.transactionInclude(),
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
      }),
      this.prisma.transaction.count({ where: topLevelWhere }),
      this.getSummary(where),
    ]);

    const installmentsByGroup = await this.getInstallmentsByGroup(
      userId,
      items,
    );

    return {
      summary,
      items: items.map((item) =>
        this.serializeItem(
          item,
          installmentsByGroup.get(item.installmentGroupId ?? ''),
        ),
      ),
      pagination: {
        page: query.page,
        perPage: query.perPage,
        total,
        totalPages: Math.ceil(total / query.perPage),
      },
    };
  }

  private buildWhere(
    userId: string,
    query: QueryFinancialGridDto,
  ): Prisma.TransactionWhereInput {
    return {
      userId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.accountId ? { accountId: query.accountId } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
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
              ...(query.startDate
                ? {
                    gte: dayjs(toDate(query.startDate)).startOf('day').toDate(),
                  }
                : {}),
              ...(query.endDate
                ? { lte: dayjs(toDate(query.endDate)).endOf('day').toDate() }
                : {}),
            },
          }
        : {}),
    };
  }

  private async getSummary(where: Prisma.TransactionWhereInput) {
    const summaryRows = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        ...where,
        status: this.getSummaryStatusFilter(where.status),
        type: this.getSummaryTypeFilter(where.type),
      },
      _sum: { amount: true },
    });

    const pendingStatusFilter = this.getPendingStatusFilter(where.status);
    const pendingRows = pendingStatusFilter
      ? await this.prisma.transaction.groupBy({
          by: ['status'],
          where: {
            ...where,
            status: pendingStatusFilter,
          },
          _sum: { amount: true },
        })
      : [];

    const totalIncome = this.sumByType(summaryRows, TransactionType.INCOME);
    const totalExpense = this.sumByType(summaryRows, TransactionType.EXPENSE);
    const totalPending = pendingRows.reduce(
      (sum, item) => sum + Number(item._sum.amount ?? 0),
      0,
    );

    return {
      totalIncome,
      totalExpense,
      periodBalance: totalIncome - totalExpense,
      totalPending,
    };
  }

  private async getInstallmentsByGroup(
    userId: string,
    items: FinancialGridTransaction[],
  ) {
    const groupIds = [
      ...new Set(items.map((item) => item.installmentGroupId).filter(Boolean)),
    ] as string[];

    if (!groupIds.length) {
      return new Map<string, FinancialGridTransaction[]>();
    }

    const installments = await this.prisma.transaction.findMany({
      where: {
        userId,
        installmentGroupId: { in: groupIds },
      },
      include: this.transactionInclude(),
      orderBy: [
        { installmentGroupId: 'asc' },
        { installmentNumber: 'asc' },
        { transactionDate: 'asc' },
      ],
    });

    return installments.reduce((map, installment) => {
      const groupId = installment.installmentGroupId;
      if (!groupId) {
        return map;
      }

      const groupInstallments = map.get(groupId) ?? [];
      groupInstallments.push(installment);
      map.set(groupId, groupInstallments);
      return map;
    }, new Map<string, FinancialGridTransaction[]>());
  }

  private serializeItem(
    item: FinancialGridTransaction,
    installments: FinancialGridTransaction[] = [],
  ) {
    const isInstallmentParent = Boolean(item.installmentGroupId);

    return {
      id: isInstallmentParent ? item.installmentGroupId : item.id,
      transactionId: item.id,
      date: item.transactionDate,
      dueDate: item.dueDate,
      title: item.installmentGroup?.title ?? item.title,
      description: item.description,
      type: item.type,
      paymentMethod: item.paymentMethod,
      amount: isInstallmentParent
        ? Number(item.installmentGroup?.totalAmount ?? item.amount)
        : Number(item.amount),
      status: item.status,
      account: item.account,
      destinationAccount: item.destinationAccount,
      category: item.category,
      costCenter: item.costCenter,
      installment: item.installmentGroup
        ? {
            groupId: item.installmentGroup.id,
            current: item.installmentNumber,
            total: item.installmentGroup.totalInstallments,
            totalAmount: Number(item.installmentGroup.totalAmount),
            isExpandable: installments.length > 0,
          }
        : null,
      installments: installments.map((installment) =>
        this.serializeInstallment(installment),
      ),
      source: item.source,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private serializeInstallment(item: FinancialGridTransaction) {
    return {
      id: item.id,
      date: item.transactionDate,
      dueDate: item.dueDate,
      title: item.title,
      amount: Number(item.amount),
      status: item.status,
      installmentNumber: item.installmentNumber,
      totalInstallments: item.totalInstallments,
      account: item.account,
      category: item.category,
      costCenter: item.costCenter,
    };
  }

  private sumByType(
    rows: Array<{
      type: TransactionType;
      _sum: {
        amount: Prisma.Decimal | null;
      };
    }>,
    type: TransactionType,
  ) {
    return Number(rows.find((item) => item.type === type)?._sum.amount ?? 0);
  }

  private getSummaryStatusFilter(
    status?: Prisma.TransactionWhereInput['status'],
  ) {
    if (status === TransactionStatus.CANCELED) {
      return { in: [] };
    }

    return status ?? { not: TransactionStatus.CANCELED };
  }

  private getSummaryTypeFilter(type?: Prisma.TransactionWhereInput['type']) {
    if (type === TransactionType.INCOME || type === TransactionType.EXPENSE) {
      return type;
    }

    if (type === TransactionType.TRANSFER) {
      return type;
    }

    return { in: [TransactionType.INCOME, TransactionType.EXPENSE] };
  }

  private getPendingStatusFilter(
    status?: Prisma.TransactionWhereInput['status'],
  ) {
    if (
      status === TransactionStatus.PENDING ||
      status === TransactionStatus.OVERDUE
    ) {
      return status;
    }

    if (status) {
      return null;
    }

    return { in: [TransactionStatus.PENDING, TransactionStatus.OVERDUE] };
  }

  private transactionInclude() {
    return {
      account: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      destinationAccount: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
      costCenter: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      installmentGroup: {
        select: {
          id: true,
          title: true,
          totalAmount: true,
          totalInstallments: true,
        },
      },
    } satisfies Prisma.TransactionInclude;
  }
}
