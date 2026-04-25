import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateInstallmentPlanDto {
  @IsString()
  accountId!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  costCenterId?: string;

  @IsEnum(TransactionType)
  type: TransactionType = TransactionType.EXPENSE;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  amount!: number;

  @IsInt()
  @Min(2)
  @Max(120)
  totalInstallments!: number;

  @IsDateString()
  firstDueDate!: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
