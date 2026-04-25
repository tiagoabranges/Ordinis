import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';

@Injectable()
export class CostCentersService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateCostCenterDto) {
    return this.prisma.costCenter.create({
      data: {
        userId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        color: dto.color,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.costCenter.findMany({
      where: {
        OR: [{ userId }, { isDefault: true }],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const costCenter = await this.prisma.costCenter.findUnique({
      where: { id },
    });
    if (
      !costCenter ||
      (!costCenter.isDefault && costCenter.userId !== userId)
    ) {
      throw new NotFoundException('Centro de custo não encontrado.');
    }
    return costCenter;
  }

  async update(userId: string, id: string, dto: UpdateCostCenterDto) {
    await this.findOne(userId, id);
    return this.prisma.costCenter.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const costCenter = await this.findOne(userId, id);
    if (costCenter.isDefault) {
      throw new NotFoundException(
        'Centro de custo padrão não pode ser removido.',
      );
    }

    await this.prisma.costCenter.delete({ where: { id } });
    return { success: true };
  }

  async ensureOwned(userId: string, id?: string | null) {
    if (!id) {
      return null;
    }

    return this.findOne(userId, id);
  }
}
