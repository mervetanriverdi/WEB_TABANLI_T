import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @IsOptional()
  @IsString({ message: 'Etiket adi metin olmalidir.' })
  @IsNotEmpty({ message: 'Etiket adi bos olamaz.' })
  name?: string;
}
