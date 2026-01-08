import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'E-posta formati gecersiz.' })
  @IsNotEmpty({ message: 'E-posta zorunludur.' })
  email: string;

  @IsString({ message: 'Sifre metin olmalidir.' })
  @IsNotEmpty({ message: 'Sifre zorunludur.' })
  password: string;
}
