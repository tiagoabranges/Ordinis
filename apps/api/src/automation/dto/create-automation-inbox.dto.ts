import { AutomationSource } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAutomationInboxDto {
  @IsString()
  rawText!: string;

  @IsOptional()
  @IsEnum(AutomationSource)
  source?: AutomationSource;
}
