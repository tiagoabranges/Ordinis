import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateInstallmentPlanDto } from './dto/create-installment-plan.dto';
import { InstallmentsService } from './installments.service';

@ApiTags('installments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateInstallmentPlanDto,
  ) {
    return this.installmentsService.create(user.id, dto);
  }
}
