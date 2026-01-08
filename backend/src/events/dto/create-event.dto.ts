import { IsArray, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateEventDto {
  @IsString({ message: 'Baslik metin olmalidir.' })
  @IsNotEmpty({ message: 'Baslik zorunludur.' })
  title: string;

  @IsString({ message: 'Aciklama metin olmalidir.' })
  @IsNotEmpty({ message: 'Aciklama zorunludur.' })
  description: string;

  @IsString({ message: 'Konum metin olmalidir.' })
  @IsNotEmpty({ message: 'Konum zorunludur.' })
  location: string;

  @IsDateString({}, { message: 'Baslangic tarihi gecersiz.' })
  startAt: string;

  @IsDateString({}, { message: 'Bitis tarihi gecersiz.' })
  endAt: string;

  @IsInt({ message: 'Kapasite sayi olmalidir.' })
  @Min(1, { message: 'Kapasite en az 1 olmalidir.' })
  capacity: number;

  @IsOptional()
  @IsArray({ message: 'Admin ID listesi dizi olmalidir.' })
  @IsInt({ each: true, message: 'Her admin ID sayi olmalidir.' })
  adminIds?: number[];
}
