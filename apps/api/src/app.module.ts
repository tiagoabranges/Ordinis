import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { AuthModule } from './auth/auth.module';
import { AutomationModule } from './automation/automation.module';
import { CategoriesModule } from './categories/categories.module';
import { validateEnv } from './config/env.validation';
import { CostCentersModule } from './cost-centers/cost-centers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FinancialGridModule } from './financial-grid/financial-grid.module';
import { HealthModule } from './health/health.module';
import { ImportsModule } from './imports/imports.module';
import { InstallmentsModule } from './installments/installments.module';
import { PrismaModule } from './prisma/prisma.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    CategoriesModule,
    CostCentersModule,
    TransactionsModule,
    InstallmentsModule,
    RecurringTransactionsModule,
    DashboardModule,
    FinancialGridModule,
    ImportsModule,
    AttachmentsModule,
    AutomationModule,
    HealthModule,
  ],
})
export class AppModule {}
