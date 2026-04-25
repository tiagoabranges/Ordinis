import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AttachmentsService } from './attachments.service';

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post(':transactionId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(
            null,
            `${process.cwd()}/${process.env.UPLOAD_DIR ?? './storage'}/attachments`,
          );
        },
        filename: (_req, file, callback) => {
          callback(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @CurrentUser() user: { id: string },
    @Param('transactionId') transactionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.create(user.id, transactionId, file);
  }

  @Get(':transactionId')
  findAll(
    @CurrentUser() user: { id: string },
    @Param('transactionId') transactionId: string,
  ) {
    return this.attachmentsService.findAll(user.id, transactionId);
  }

  @Delete('file/:id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.attachmentsService.remove(user.id, id);
  }
}
