import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConfirmImportDto } from './dto/confirm-import.dto';
import { PreviewImportDto } from './dto/preview-import.dto';
import { ImportsService } from './imports.service';

@ApiTags('imports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('preview')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  preview(
    @CurrentUser() user: { id: string },
    @Body() dto: PreviewImportDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.importsService.preview(user.id, dto, file);
  }

  @Post('confirm')
  confirm(@CurrentUser() user: { id: string }, @Body() dto: ConfirmImportDto) {
    return this.importsService.confirm(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.importsService.findAll(user.id);
  }
}
