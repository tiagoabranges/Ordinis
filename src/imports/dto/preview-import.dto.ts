import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PreviewImportDto {
  @IsString()
  accountId!: string;

  @IsString()
  dateColumn!: string;

  @IsString()
  amountColumn!: string;

  @IsString()
  titleColumn!: string;

  @IsOptional()
  @IsString()
  descriptionColumn?: string;

  @IsOptional()
  @IsString()
  typeColumn?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  delimiter?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasHeader?: boolean = true;
}
