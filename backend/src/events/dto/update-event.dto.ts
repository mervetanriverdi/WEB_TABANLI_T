import { IsArray, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString({ message: 'Baslik metin olmalidir.' })
  @IsNotEmpty({ message: 'Baslik bos olamaz.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Aciklama metin olmalidir.' })
  @IsNotEmpty({ message: 'Aciklama bos olamaz.' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Konum metin olmalidir.' })
  @IsNotEmpty({ message: 'Konum bos olamaz.' })
  location?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Baslangic tarihi gecersiz.' })
  startAt?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Bitis tarihi gecersiz.' })
  endAt?: string;

  @IsOptional()
  @IsInt({ message: 'Kapasite sayi olmalidir.' })
  @Min(1, { message: 'Kapasite en az 1 olmalidir.' })
  capacity?: number;

  @IsOptional()
  @IsArray({ message: 'Admin ID listesi dizi olmalidir.' })
  @IsInt({ each: true, message: 'Her admin ID sayi olmalidir.' })
  adminIds?: number[];
}
