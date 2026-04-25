import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { QueryFinancialGridDto } from './dto/query-financial-grid.dto';
import { FinancialGridService } from './financial-grid.service';

@ApiTags('financial-grid')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financial-grid')
export class FinancialGridController {
  constructor(private readonly financialGridService: FinancialGridService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: QueryFinancialGridDto,
  ) {
    return this.financialGridService.findAll(user.id, query);
  }
}
