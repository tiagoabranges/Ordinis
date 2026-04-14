import {
  PaymentMethod,
  RecurrenceFrequency,
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

export class CreateRecurringTransactionDto {
  @IsString()
  accountId!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  costCenterId?: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  amount!: number;

  @IsEnum(RecurrenceFrequency)
  frequency!: RecurrenceFrequency;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  interval?: number;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
