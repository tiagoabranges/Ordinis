import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PaymentMethod,
  TransactionSource,
  TransactionType,
} from '@prisma/client';
import { parse } from 'csv-parse/sync';
import dayjs from 'dayjs';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { sha256 } from '../common/utils/hash.util';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ConfirmImportDto } from './dto/confirm-import.dto';
import { PreviewImportDto } from './dto/preview-import.dto';

type ParsedPreviewRow = {
  transactionDate: string;
  amount: number;
  title: string;
  description?: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  suggestionCategoryId: string | null;
  raw: Record<string, string>;
  externalHash: string;
};

@Injectable()
export class ImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
    private readonly categoriesService: CategoriesService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async preview(
    userId: string,
    dto: PreviewImportDto,
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo CSV é obrigatório.');
    }

    await this.accountsService.ensureOwned(userId, dto.accountId);

    const rows = parse(file.buffer, {
      columns: dto.hasHeader ?? true,
      delimiter: dto.delimiter ?? ',',
      skip_empty_lines: true,
      trim: true,
    }) as unknown as Record<string, string>[];

    const categories = await this.categoriesService.findAll(userId);
    const previewRows = rows
      .slice(0, 100)
      .map((row) => this.normalizeRow(userId, row, dto, categories));

    const importJob = await this.prisma.importJob.create({
      data: {
        userId,
        accountId: dto.accountId,
        filename: file.originalname,
        status: 'PREVIEWED',
        columnMapping: { ...dto } as Record<
          string,
          string | boolean | undefined
        >,
        previewRows: previewRows as unknown as object,
        totalRows: rows.length,
      },
    });

    return {
      importJobId: importJob.id,
      totalRows: rows.length,
      previewRows,
    };
  }

  async confirm(userId: string, dto: ConfirmImportDto) {
    const importJob = await this.prisma.importJob.findUnique({
      where: { id: dto.importJobId },
    });

    if (!importJob || importJob.userId !== userId) {
      throw new NotFoundException('Importação não encontrada.');
    }

    const previewRows =
      (importJob.previewRows as ParsedPreviewRow[] | null) ?? [];
    const result = await this.transactionsService.createFromImport(
      userId,
      previewRows.map((row) => ({
        accountId: importJob.accountId!,
        categoryId: row.suggestionCategoryId,
        type: row.type,
        paymentMethod: row.paymentMethod,
        title: row.title,
        description: row.description,
        amount: row.amount,
        transactionDate: dayjs(row.transactionDate).toDate(),
        source: TransactionSource.IMPORT,
        rawInput: row.raw,
        externalHash: row.externalHash,
      })),
    );

    await this.prisma.importJob.update({
      where: { id: importJob.id },
      data: {
        status: 'CONFIRMED',
        importedRows: result.imported,
        duplicateRows: result.duplicates,
        confirmedAt: new Date(),
      },
    });

    return result;
  }

  findAll(userId: string) {
    return this.prisma.importJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private normalizeRow(
    userId: string,
    row: Record<string, string>,
    dto: PreviewImportDto,
    categories: Awaited<ReturnType<CategoriesService['findAll']>>,
  ): ParsedPreviewRow {
    const title = row[dto.titleColumn]?.trim();
    const rawAmount = row[dto.amountColumn]
      ?.replace(/\./g, '')
      .replace(',', '.');
    const rawDate = row[dto.dateColumn]?.trim();

    if (!title || !rawAmount || !rawDate) {
      throw new BadRequestException('CSV com colunas obrigatórias inválidas.');
    }

    const amount = Math.abs(Number(rawAmount));
    const type =
      dto.typeColumn && row[dto.typeColumn]
        ? row[dto.typeColumn].toLowerCase().includes('rece')
          ? TransactionType.INCOME
          : TransactionType.EXPENSE
        : Number(rawAmount) >= 0
          ? TransactionType.INCOME
          : TransactionType.EXPENSE;
    const description = dto.descriptionColumn
      ? row[dto.descriptionColumn]
      : undefined;
    const lowerText = `${title} ${description ?? ''}`.toLowerCase();
    const suggestedCategory =
      categories.find((category) =>
        (category.keywords ?? []).some((keyword) =>
          lowerText.includes(keyword.toLowerCase()),
        ),
      ) ?? null;

    return {
      transactionDate: dayjs(rawDate, [
        'DD/MM/YYYY',
        'YYYY-MM-DD',
      ]).toISOString(),
      amount,
      title,
      description,
      type,
      paymentMethod:
        (dto.paymentMethod?.toUpperCase() as PaymentMethod) ??
        PaymentMethod.OTHER,
      suggestionCategoryId: suggestedCategory?.id ?? null,
      raw: row,
      externalHash: sha256(
        `${userId}:${dto.accountId}:${title}:${amount}:${rawDate}:${description ?? ''}`,
      ),
    };
  }
}
