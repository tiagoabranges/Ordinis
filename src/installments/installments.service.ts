import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateInstallmentPlanDto } from './dto/create-installment-plan.dto';

@Injectable()
export class InstallmentsService {
  constructor(private readonly transactionsService: TransactionsService) {}

  create(userId: string, dto: CreateInstallmentPlanDto) {
    return this.transactionsService.createInstallments(userId, {
      ...dto,
      transactionDate: dto.firstDueDate,
    });
  }
}
