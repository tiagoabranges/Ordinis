import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { mkdirSync } from 'node:fs';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const uploadDir = configService.get<string>('UPLOAD_DIR', './storage');

  mkdirSync(uploadDir, { recursive: true });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: configService.get<string>('APP_ORIGIN', '*'),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get<string>('APP_NAME', 'Ordinis API'))
    .setDescription('API financeira do Ordinis')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.get<number>('PORT', 3000));
}
void bootstrap();
