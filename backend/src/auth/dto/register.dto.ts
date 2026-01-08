import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Ad alani metin olmalidir.' })
  @IsNotEmpty({ message: 'Ad alani zorunludur.' })
  name: string;

  @IsEmail({}, { message: 'E-posta formati gecersiz.' })
  @IsNotEmpty({ message: 'E-posta zorunludur.' })
  email: string;

  @IsString({ message: 'Sifre metin olmalidir.' })
  @MinLength(6, { message: 'Sifre en az 6 karakter olmalidir.' })
  password: string;
}
