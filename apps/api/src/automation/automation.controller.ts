import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AutomationService } from './automation.service';
import { CreateAutomationInboxDto } from './dto/create-automation-inbox.dto';

@ApiTags('automation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('inbox')
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateAutomationInboxDto,
  ) {
    return this.automationService.create(user.id, dto);
  }

  @Get('inbox')
  findAll(@CurrentUser() user: { id: string }) {
    return this.automationService.findAll(user.id);
  }
}
