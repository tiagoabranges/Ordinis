import { Injectable } from '@nestjs/common';
import { AutomationSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutomationInboxDto } from './dto/create-automation-inbox.dto';

@Injectable()
export class AutomationService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateAutomationInboxDto) {
    return this.prisma.automationInbox.create({
      data: {
        userId,
        rawText: dto.rawText,
        source: dto.source ?? AutomationSource.WEB,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.automationInbox.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
