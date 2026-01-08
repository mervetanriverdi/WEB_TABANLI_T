import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCommentDto {
  @IsInt({ message: 'Etkinlik ID sayi olmalidir.' })
  @Min(1, { message: 'Etkinlik ID 1 veya daha buyuk olmalidir.' })
  eventId: number;

  @IsString({ message: 'Yorum metin olmalidir.' })
  @IsNotEmpty({ message: 'Yorum zorunludur.' })
  content: string;
}
