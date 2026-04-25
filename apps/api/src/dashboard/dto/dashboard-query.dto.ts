import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class DashboardQueryDto {
  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
