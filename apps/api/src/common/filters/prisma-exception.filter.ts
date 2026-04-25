import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception.code === 'P2002') {
      response.status(HttpStatus.CONFLICT).json({
        message: 'Registro duplicado.',
        meta: exception.meta,
      });
      return;
    }

    if (exception.code === 'P2025') {
      response.status(HttpStatus.NOT_FOUND).json({
        message: 'Registro não encontrado.',
      });
      return;
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      message: 'Erro de persistência.',
      code: exception.code,
    });
  }
}
