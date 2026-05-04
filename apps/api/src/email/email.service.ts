import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type WelcomeEmailInput = {
  email: string;
  fullName: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendWelcomeEmail({ email, fullName }: WelcomeEmailInput) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from = this.configService.get<string>(
      'EMAIL_FROM',
      'Ordinis <noreply@ordinis.app>',
    );
    const firstName = fullName.trim().split(/\s+/)[0] || fullName;

    const subject = 'Bem-vindo ao Ordinis';
    const text = [
      `Olá, ${firstName}.`,
      '',
      'Sua conta no Ordinis foi criada com sucesso.',
      'Agora você já pode entrar no sistema e começar a organizar sua planilha financeira.',
      '',
      'Seja bem-vindo!',
      'Equipe Ordinis',
    ].join('\n');

    if (!apiKey) {
      this.logger.log(
        `Email de boas-vindas simulado para ${email}: ${subject}`,
      );
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: email,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(
        `Falha ao enviar email de boas-vindas para ${email}: ${body}`,
      );
    }
  }
}
