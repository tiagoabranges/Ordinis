import { IsDateString, IsOptional } from 'class-validator';

export class MarkTransactionPaidDto {
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
