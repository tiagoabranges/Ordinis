import 'dotenv/config';
import { hash } from 'bcryptjs';
import {
  AccountType,
  CategoryType,
  PaymentMethod,
  PrismaClient,
  RecurrenceFrequency,
  TransactionSource,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  const userEmail = 'demo@ordinis.app';
  const passwordHash = await hash('demo12345', 12);

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      fullName: 'Usuário Demo Ordinis',
      passwordHash,
    },
    create: {
      email: userEmail,
      fullName: 'Usuário Demo Ordinis',
      passwordHash,
    },
  });

  await prisma.attachment.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.recurringTransaction.deleteMany({ where: { userId: user.id } });
  await prisma.installmentGroup.deleteMany({ where: { userId: user.id } });
  await prisma.automationInbox.deleteMany({ where: { userId: user.id } });
  await prisma.importJob.deleteMany({ where: { userId: user.id } });

  const accountData = [
    {
      name: 'Conta Corrente Principal',
      type: AccountType.CHECKING,
      institution: 'Banco Ordinis',
      initialBalance: 8500,
    },
    {
      name: 'Carteira PIX',
      type: AccountType.WALLET,
      institution: 'Saldo Instantâneo',
      initialBalance: 1200,
    },
    {
      name: 'Cartão Empresarial',
      type: AccountType.CREDIT_CARD,
      institution: 'Banco Ordinis',
      initialBalance: 0,
      creditLimit: 15000,
      closingDay: 8,
      dueDay: 15,
    },
  ];

  const accountMap = new Map<string, string>();
  for (const account of accountData) {
    const created = await prisma.account.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: account.name,
        },
      },
      update: account,
      create: {
        userId: user.id,
        currency: 'BRL',
        ...account,
      },
    });

    accountMap.set(account.name, created.id);
  }

  const categories = [
    {
      name: 'Salário',
      slug: 'salario',
      type: CategoryType.INCOME,
      isDefault: true,
      isSystem: true,
      keywords: ['salario', 'folha', 'pagamento'],
      color: '#166534',
    },
    {
      name: 'Serviços',
      slug: 'servicos',
      type: CategoryType.EXPENSE,
      isDefault: true,
      isSystem: true,
      keywords: ['pedreiro', 'eletricista', 'manutencao', 'servico'],
      color: '#b45309',
    },
    {
      name: 'Moradia',
      slug: 'moradia',
      type: CategoryType.EXPENSE,
      isDefault: true,
      isSystem: true,
      keywords: ['aluguel', 'condominio', 'agua', 'luz'],
      color: '#1d4ed8',
    },
    {
      name: 'Alimentação',
      slug: 'alimentacao',
      type: CategoryType.EXPENSE,
      isDefault: true,
      isSystem: true,
      keywords: ['mercado', 'ifood', 'restaurante'],
      color: '#dc2626',
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: {
        userId_slug: {
          userId: user.id,
          slug: category.slug,
        },
      },
      update: category,
      create: {
        userId: user.id,
        ...category,
      },
    });

    categoryMap.set(category.slug, created.id);
  }

  const costCenters = [
    {
      name: 'Pessoal',
      code: 'PESSOAL',
      description: 'Despesas da vida pessoal',
      isDefault: true,
      color: '#0f766e',
    },
    {
      name: 'Consultoria',
      code: 'CONSULTORIA',
      description: 'Custos ligados ao trabalho profissional',
      isDefault: true,
      color: '#7c3aed',
    },
  ];

  const costCenterMap = new Map<string, string>();
  for (const costCenter of costCenters) {
    const created = await prisma.costCenter.upsert({
      where: {
        userId_code: {
          userId: user.id,
          code: costCenter.code,
        },
      },
      update: costCenter,
      create: {
        userId: user.id,
        ...costCenter,
      },
    });

    costCenterMap.set(costCenter.code, created.id);
  }

  const installmentGroup = await prisma.installmentGroup.create({
    data: {
      userId: user.id,
      title: 'Pedreiro Reforma',
      description: 'Obra da varanda em 3 parcelas',
      totalAmount: 5000,
      totalInstallments: 3,
    },
  });

  const now = dayjs();
  const transactionSeed = [
    {
      title: 'Recebimento salário',
      type: TransactionType.INCOME,
      paymentMethod: PaymentMethod.PIX,
      accountId: accountMap.get('Conta Corrente Principal')!,
      categoryId: categoryMap.get('salario')!,
      costCenterId: costCenterMap.get('PESSOAL')!,
      amount: 12000,
      transactionDate: now.startOf('month').add(2, 'day').toDate(),
      dueDate: now.startOf('month').add(2, 'day').toDate(),
      status: TransactionStatus.PAID,
    },
    {
      title: 'Supermercado mensal',
      type: TransactionType.EXPENSE,
      paymentMethod: PaymentMethod.DEBIT,
      accountId: accountMap.get('Conta Corrente Principal')!,
      categoryId: categoryMap.get('alimentacao')!,
      costCenterId: costCenterMap.get('PESSOAL')!,
      amount: 980,
      transactionDate: now.startOf('month').add(5, 'day').toDate(),
      dueDate: now.startOf('month').add(5, 'day').toDate(),
      status: TransactionStatus.PAID,
    },
    {
      title: 'Transferência para carteira',
      type: TransactionType.TRANSFER,
      paymentMethod: PaymentMethod.TRANSFER,
      accountId: accountMap.get('Conta Corrente Principal')!,
      destinationAccountId: accountMap.get('Carteira PIX')!,
      amount: 500,
      transactionDate: now.startOf('month').add(6, 'day').toDate(),
      dueDate: now.startOf('month').add(6, 'day').toDate(),
      status: TransactionStatus.PAID,
    },
  ];

  for (const transaction of transactionSeed) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        title: transaction.title,
        type: transaction.type,
        paymentMethod: transaction.paymentMethod,
        accountId: transaction.accountId,
        destinationAccountId: transaction.destinationAccountId,
        categoryId: transaction.categoryId,
        costCenterId: transaction.costCenterId,
        amount: transaction.amount,
        transactionDate: transaction.transactionDate,
        dueDate: transaction.dueDate,
        status: transaction.status,
        source: TransactionSource.MANUAL,
      },
    });
  }

  for (let index = 0; index < 3; index += 1) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: accountMap.get('Cartão Empresarial')!,
        categoryId: categoryMap.get('servicos')!,
        costCenterId: costCenterMap.get('CONSULTORIA')!,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.CREDIT,
        title: `Pedreiro ${index + 1}/3`,
        description: 'Pagamento parcelado da reforma',
        amount: index === 2 ? 1666.66 : 1666.67,
        transactionDate: now.startOf('month').add(10 + index * 30, 'day').toDate(),
        dueDate: now.startOf('month').add(10 + index * 30, 'day').toDate(),
        status: index === 0 ? TransactionStatus.PAID : TransactionStatus.PENDING,
        installmentGroupId: installmentGroup.id,
        installmentNumber: index + 1,
        totalInstallments: 3,
        source: TransactionSource.MANUAL,
      },
    });
  }

  await prisma.recurringTransaction.create({
    data: {
      userId: user.id,
      accountId: accountMap.get('Conta Corrente Principal')!,
      categoryId: categoryMap.get('moradia')!,
      costCenterId: costCenterMap.get('PESSOAL')!,
      type: TransactionType.EXPENSE,
      paymentMethod: PaymentMethod.BOLETO,
      title: 'Aluguel',
      amount: 2500,
      frequency: RecurrenceFrequency.MONTHLY,
      interval: 1,
      startDate: now.startOf('month').toDate(),
      nextOccurrence: now.add(1, 'month').startOf('month').toDate(),
      notes: 'Recorrência criada no seed',
    },
  });

  console.log('Seed finalizado com sucesso.');
  console.log(`Login demo: ${userEmail} / demo12345`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
