import { IsDateString, IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  fullName!: string;

  @IsDateString()
  birthDate!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
