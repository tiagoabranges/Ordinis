import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { CategoriesModule } from '../categories/categories.module';
import { CostCentersModule } from '../cost-centers/cost-centers.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { RecurringTransactionsService } from './recurring-transactions.service';

@Module({
  imports: [
    AccountsModule,
    CategoriesModule,
    CostCentersModule,
    TransactionsModule,
  ],
  controllers: [RecurringTransactionsController],
  providers: [RecurringTransactionsService],
})
export class RecurringTransactionsModule {}
