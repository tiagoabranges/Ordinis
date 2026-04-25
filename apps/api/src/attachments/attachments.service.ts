import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdirSync } from 'node:fs';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: TransactionsService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    userId: string,
    transactionId: string,
    file: Express.Multer.File,
  ) {
    await this.transactionsService.findOne(userId, transactionId);
    const uploadDir = `${this.configService.get<string>('UPLOAD_DIR', './storage')}/attachments`;
    mkdirSync(uploadDir, { recursive: true });

    return this.prisma.attachment.create({
      data: {
        userId,
        transactionId,
        originalName: file.originalname,
        storedName: file.filename,
        storagePath: file.path,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }

  findAll(userId: string, transactionId: string) {
    return this.prisma.attachment.findMany({
      where: {
        userId,
        transactionId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: string, id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment || attachment.userId !== userId) {
      throw new NotFoundException('Anexo não encontrado.');
    }

    await this.prisma.attachment.delete({ where: { id } });
    return { success: true };
  }
}
