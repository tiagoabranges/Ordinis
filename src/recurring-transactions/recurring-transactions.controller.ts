import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { RecurringTransactionsService } from './recurring-transactions.service';

@ApiTags('recurring-transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateRecurringTransactionDto,
  ) {
    return this.recurringTransactionsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.recurringTransactionsService.findAll(user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateRecurringTransactionDto,
  ) {
    return this.recurringTransactionsService.update(user.id, id, dto);
  }

  @Post(':id/terminate')
  terminate(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.recurringTransactionsService.terminate(user.id, id);
  }

  @Post('generate')
  generate(@CurrentUser() user: { id: string }) {
    return this.recurringTransactionsService.generatePending(user.id);
  }
}
