import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
  @IsString({ message: 'Etiket adi metin olmalidir.' })
  @IsNotEmpty({ message: 'Etiket adi zorunludur.' })
  name: string;
}
