import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { Registration } from '../entities/registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
  ) {}

  async create(dto: CreateRegistrationDto, userId: number) {
    const event = await this.eventsRepository.findOne({ where: { id: dto.eventId } });
    if (!event) {
      throw new NotFoundException('Etkinlik bulunamadi.');
    }

    const existing = await this.registrationsRepository.findOne({
      where: { userId, eventId: dto.eventId },
    });
    if (existing) {
      throw new BadRequestException('Bu etkinlige zaten kayitlisiniz.');
    }

    const registration = this.registrationsRepository.create({
      userId,
      eventId: dto.eventId,
    });

    return this.registrationsRepository.save(registration);
  }

  async remove(id: number, userId: number) {
    const registration = await this.registrationsRepository.findOne({ where: { id } });
    if (!registration) {
      throw new NotFoundException('Kayit bulunamadi.');
    }

    if (registration.userId !== userId) {
      throw new ForbiddenException('Bu kaydi silemezsiniz.');
    }

    await this.registrationsRepository.remove(registration);
    return { message: 'Kayit iptal edildi.' };
  }

  async findMine(userId: number) {
    return this.registrationsRepository.find({
      where: { userId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.registrationsRepository.find({
      relations: ['event', 'user'],
      order: { createdAt: 'DESC' },
    });
  }
}
