import { AccountType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateAccountDto {
  @IsString()
  name!: string;

  @IsEnum(AccountType)
  type!: AccountType;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNumber()
  initialBalance!: number;

  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  closingDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;
}
