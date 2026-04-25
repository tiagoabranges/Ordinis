import { IsString } from 'class-validator';

export class ConfirmImportDto {
  @IsString()
  importJobId!: string;
}
