import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        slug: dto.slug,
        type: dto.type,
        color: dto.color,
        icon: dto.icon,
        keywords: dto.keywords ?? [],
      },
    });
  }

  findAll(userId: string, type?: CategoryType) {
    return this.prisma.category.findMany({
      where: {
        OR: [{ userId }, { isDefault: true }],
        ...(type ? { type } : {}),
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category || (!category.isDefault && category.userId !== userId)) {
      throw new NotFoundException('Categoria não encontrada.');
    }
    return category;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(userId, id);
    if (category.isSystem) {
      throw new NotFoundException('Categoria do sistema não pode ser editada.');
    }

    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const category = await this.findOne(userId, id);
    if (category.isDefault) {
      throw new NotFoundException('Categoria padrão não pode ser removida.');
    }

    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  async ensureOwned(userId: string, id?: string | null) {
    if (!id) {
      return null;
    }

    return this.findOne(userId, id);
  }
}
