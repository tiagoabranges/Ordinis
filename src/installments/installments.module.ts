import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { InstallmentsController } from './installments.controller';
import { InstallmentsService } from './installments.service';

@Module({
  imports: [TransactionsModule],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
})
export class InstallmentsModule {}
