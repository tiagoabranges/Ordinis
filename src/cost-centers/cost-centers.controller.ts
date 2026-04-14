import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';

@ApiTags('cost-centers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCostCenterDto,
  ) {
    return this.costCentersService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.costCentersService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.costCentersService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCostCenterDto,
  ) {
    return this.costCentersService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.costCentersService.remove(user.id, id);
  }
}
