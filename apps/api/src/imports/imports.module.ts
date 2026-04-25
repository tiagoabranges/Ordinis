import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  imports: [AccountsModule, CategoriesModule, TransactionsModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
