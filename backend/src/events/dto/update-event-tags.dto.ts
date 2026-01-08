import { ArrayUnique, IsArray, IsInt, Min } from 'class-validator';

export class UpdateEventTagsDto {
  @IsArray({ message: 'Etiket listesi dizi olmalidir.' })
  @ArrayUnique({ message: 'Etiketler benzersiz olmalidir.' })
  @IsInt({ each: true, message: 'Etiket ID sayi olmalidir.' })
  @Min(1, { each: true, message: 'Etiket ID 1 veya daha buyuk olmalidir.' })
  tagIds: number[];
}
