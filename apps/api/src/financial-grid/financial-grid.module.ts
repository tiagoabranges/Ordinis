import { Module } from '@nestjs/common';
import { FinancialGridController } from './financial-grid.controller';
import { FinancialGridService } from './financial-grid.service';

@Module({
  controllers: [FinancialGridController],
  providers: [FinancialGridService],
})
export class FinancialGridModule {}
