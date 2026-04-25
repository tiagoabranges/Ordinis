import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import dayjs from 'dayjs';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string, query: DashboardQueryDto) {
    const baseDate = dayjs()
      .year(query.year ?? dayjs().year())
      .month((query.month ?? dayjs().month() + 1) - 1);
    const startOfMonth = baseDate.startOf('month').toDate();
    const endOfMonth = baseDate.endOf('month').toDate();
    const today = new Date();

    const [
      monthTransactions,
      upcomingPayables,
      upcomingReceivables,
      futureInstallments,
      categoryExpenses,
      costCenterExpenses,
      monthlyEvolutionRaw,
    ] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          userId,
          transactionDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      this.prisma.transaction.findMany({
        where: {
          userId,
          type: TransactionType.EXPENSE,
          status: { in: ['PENDING', 'OVERDUE'] },
          dueDate: {
            gte: today,
            lte: dayjs(today).add(14, 'day').toDate(),
          },
        },
        include: { account: true, category: true },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      this.prisma.transaction.findMany({
        where: {
          userId,
          type: TransactionType.INCOME,
          status: { in: ['PENDING', 'OVERDUE'] },
          dueDate: {
            gte: today,
            lte: dayjs(today).add(14, 'day').toDate(),
          },
        },
        include: { account: true, category: true },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      this.prisma.transaction.findMany({
        where: {
          userId,
          installmentGroupId: { not: null },
          status: { in: ['PENDING', 'OVERDUE'] },
          dueDate: { gte: today },
        },
        include: { installmentGroup: true },
        orderBy: [{ dueDate: 'asc' }],
        take: 20,
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: TransactionType.EXPENSE,
          transactionDate: { gte: startOfMonth, lte: endOfMonth },
          categoryId: { not: null },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['costCenterId'],
        where: {
          userId,
          type: TransactionType.EXPENSE,
          transactionDate: { gte: startOfMonth, lte: endOfMonth },
          costCenterId: { not: null },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        where: {
          userId,
          transactionDate: {
            gte: dayjs(startOfMonth).subtract(11, 'month').toDate(),
          },
        },
        select: {
          transactionDate: true,
          type: true,
          amount: true,
        },
      }),
    ]);

    const totals = monthTransactions.reduce(
      (acc, item) => {
        const amount = Number(item.amount);
        if (item.type === TransactionType.INCOME) {
          acc.income += amount;
        } else if (item.type === TransactionType.EXPENSE) {
          acc.expense += amount;
        }

        return acc;
      },
      { income: 0, expense: 0 },
    );

    const accounts = await this.prisma.account.findMany({
      where: { userId },
      include: {
        transactions: {
          where: {
            status: { in: ['PAID', 'PENDING', 'OVERDUE'] },
          },
          select: {
            amount: true,
            type: true,
            destinationAccountId: true,
          },
        },
        incomingTransfers: {
          where: {
            status: { in: ['PAID', 'PENDING', 'OVERDUE'] },
          },
          select: {
            amount: true,
            type: true,
          },
        },
      },
    });

    const consolidatedBalance = accounts.reduce((sum, account) => {
      const current = account.transactions.reduce((balance, transaction) => {
        const amount = Number(transaction.amount);
        if (transaction.type === TransactionType.INCOME) {
          return balance + amount;
        }
        if (transaction.type === TransactionType.EXPENSE) {
          return balance - amount;
        }

        return balance - amount;
      }, Number(account.initialBalance));

      const incomingTransferSum = account.incomingTransfers.reduce(
        (balance, transaction) => balance + Number(transaction.amount),
        0,
      );

      return sum + current + incomingTransferSum;
    }, 0);

    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categoryExpenses.map((item) => item.categoryId!).filter(Boolean),
        },
      },
      select: { id: true, name: true, color: true },
    });
    const costCenters = await this.prisma.costCenter.findMany({
      where: {
        id: {
          in: costCenterExpenses
            .map((item) => item.costCenterId!)
            .filter(Boolean),
        },
      },
      select: { id: true, name: true, color: true },
    });

    const monthlyEvolutionMap = new Map<
      string,
      { label: string; income: number; expense: number }
    >();
    monthlyEvolutionRaw.forEach((item) => {
      const label = dayjs(item.transactionDate).format('YYYY-MM');
      const bucket = monthlyEvolutionMap.get(label) ?? {
        label,
        income: 0,
        expense: 0,
      };
      if (item.type === TransactionType.INCOME) {
        bucket.income += Number(item.amount);
      } else if (item.type === TransactionType.EXPENSE) {
        bucket.expense += Number(item.amount);
      }
      monthlyEvolutionMap.set(label, bucket);
    });

    return {
      consolidatedBalance,
      monthlyIncome: totals.income,
      monthlyExpense: totals.expense,
      monthlyBalance: totals.income - totals.expense,
      upcomingPayables,
      upcomingReceivables,
      futureInstallments,
      expensesByCategory: categoryExpenses.map((item) => ({
        categoryId: item.categoryId,
        total: Number(item._sum.amount ?? 0),
        category:
          categories.find((category) => category.id === item.categoryId) ??
          null,
      })),
      expensesByCostCenter: costCenterExpenses.map((item) => ({
        costCenterId: item.costCenterId,
        total: Number(item._sum.amount ?? 0),
        costCenter:
          costCenters.find((center) => center.id === item.costCenterId) ?? null,
      })),
      monthlyEvolution: [...monthlyEvolutionMap.values()].sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
      comparison: {
        currentMonth: {
          income: totals.income,
          expense: totals.expense,
        },
        previousMonth: await this.getPreviousMonthComparison(userId, baseDate),
      },
    };
  }

  private async getPreviousMonthComparison(
    userId: string,
    baseDate: dayjs.Dayjs,
  ) {
    const previousMonth = baseDate.subtract(1, 'month');
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: previousMonth.startOf('month').toDate(),
          lte: previousMonth.endOf('month').toDate(),
        },
      },
    });

    return transactions.reduce(
      (acc, item) => {
        const amount = Number(item.amount);
        if (item.type === TransactionType.INCOME) {
          acc.income += amount;
        } else if (item.type === TransactionType.EXPENSE) {
          acc.expense += amount;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }
}
