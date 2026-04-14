import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        passwordHash: await hash(dto.password, 12),
      },
    });

    return this.issueSession(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.issueSession(user.id, user.email);
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (
        !user ||
        !user.refreshTokenHash ||
        !(await compare(dto.refreshToken, user.refreshTokenHash))
      ) {
        throw new UnauthorizedException('Refresh token inválido.');
      }

      return this.issueSession(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Refresh token inválido.');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });

    return { success: true };
  }

  async me(userId: string) {
    return this.usersService.findMe(userId);
  }

  private async issueSession(userId: string, email: string) {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_ACCESS_TTL',
        ) as never,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_REFRESH_TTL',
        ) as never,
      },
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: await hash(refreshToken, 12) },
    });

    return {
      accessToken,
      refreshToken,
      user: await this.usersService.findMe(userId),
    };
  }
}
