import { IsInt, Min } from 'class-validator';

export class CreateRegistrationDto {
  @IsInt({ message: 'Etkinlik ID sayi olmalidir.' })
  @Min(1, { message: 'Etkinlik ID 1 veya daha buyuk olmalidir.' })
  eventId: number;
}
