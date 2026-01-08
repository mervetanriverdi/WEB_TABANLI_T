import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { EventTag } from '../entities/event-tag.entity';
import { EventAdmin } from '../entities/event-admin.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventTagsDto } from './dto/update-event-tags.dto';
import { RoleName } from '../roles/role-name.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(EventTag) private readonly eventTagsRepository: Repository<EventTag>,
    @InjectRepository(EventAdmin) private readonly eventAdminsRepository: Repository<EventAdmin>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(userId?: number, userRole?: RoleName) {
    const events = await this.eventsRepository.find({
      relations: ['createdBy', 'eventTags', 'eventTags.tag', 'eventAdmins', 'eventAdmins.admin'],
      order: { startAt: 'ASC' },
    });

    // Eğer kullanıcı ADMIN ise ve userId verilmişse, sadece yetkili olduğu etkinlikleri döndür
    if (userRole === RoleName.ADMIN && userId) {
      return events.filter((event) => {
        // Oluşturan admin her zaman yetkilidir
        if (event.createdById === userId) return true;
        // EventAdmins içinde bu admin var mı kontrol et
        return event.eventAdmins?.some((ea) => ea.adminId === userId) || false;
      });
    }

    return events;
  }

  async findOne(id: number, userId?: number, userRole?: RoleName) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['createdBy', 'eventTags', 'eventTags.tag', 'eventAdmins', 'eventAdmins.admin'],
    });

    if (!event) {
      throw new NotFoundException('Etkinlik bulunamadi.');
    }

    // Eğer kullanıcı ADMIN ise ve userId verilmişse, yetki kontrolü yap
    if (userRole === RoleName.ADMIN && userId) {
      const hasAccess =
        event.createdById === userId ||
        event.eventAdmins?.some((ea) => ea.adminId === userId) ||
        false;
      if (!hasAccess) {
        throw new ForbiddenException('Bu etkinlik uzerinde yetkiniz yok.');
      }
    }

    return event;
  }

  async create(dto: CreateEventDto, createdById: number) {
    const event = this.eventsRepository.create({
      title: dto.title,
      description: dto.description,
      location: dto.location,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      capacity: dto.capacity,
      createdById,
    });

    const savedEvent = await this.eventsRepository.save(event);

    // Admin yetkilendirmelerini ekle
    if (dto.adminIds && dto.adminIds.length > 0) {
      // Sadece ADMIN rolüne sahip kullanıcıları kontrol et
      const admins = await this.usersRepository.find({
        where: { id: In(dto.adminIds), role: { name: RoleName.ADMIN } },
        relations: ['role'],
      });

      if (admins.length !== dto.adminIds.length) {
        throw new BadRequestException('Secilen kullanicilardan bazilari admin degil veya bulunamadi.');
      }

      // Oluşturan admin'i de otomatik ekle (eğer listede yoksa)
      const adminIdsSet = new Set(dto.adminIds);
      if (!adminIdsSet.has(createdById)) {
        adminIdsSet.add(createdById);
      }

      const eventAdmins = Array.from(adminIdsSet).map((adminId) =>
        this.eventAdminsRepository.create({ eventId: savedEvent.id, adminId }),
      );

      await this.eventAdminsRepository.save(eventAdmins);
    } else {
      // Eğer admin seçilmemişse, sadece oluşturan admin'i ekle
      const eventAdmin = this.eventAdminsRepository.create({
        eventId: savedEvent.id,
        adminId: createdById,
      });
      await this.eventAdminsRepository.save(eventAdmin);
    }

    return this.findOne(savedEvent.id);
  }

  async update(id: number, dto: UpdateEventDto, userId?: number, userRole?: RoleName) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['eventAdmins'],
    });
    if (!event) {
      throw new NotFoundException('Etkinlik bulunamadi.');
    }

    // Yetki kontrolü
    if (userRole === RoleName.ADMIN && userId) {
      const hasAccess =
        event.createdById === userId ||
        event.eventAdmins?.some((ea) => ea.adminId === userId) ||
        false;
      if (!hasAccess) {
        throw new ForbiddenException('Bu etkinlik uzerinde yetkiniz yok.');
      }
    }

    const updated = {
      ...event,
      ...dto,
      startAt: dto.startAt ? new Date(dto.startAt) : event.startAt,
      endAt: dto.endAt ? new Date(dto.endAt) : event.endAt,
    };

    await this.eventsRepository.save(updated);

    // Admin yetkilendirmelerini güncelle
    if (dto.adminIds !== undefined) {
      await this.eventAdminsRepository.delete({ eventId: id });

      if (dto.adminIds.length > 0) {
        const admins = await this.usersRepository.find({
          where: { id: In(dto.adminIds), role: { name: RoleName.ADMIN } },
          relations: ['role'],
        });

        if (admins.length !== dto.adminIds.length) {
          throw new BadRequestException('Secilen kullanicilardan bazilari admin degil veya bulunamadi.');
        }

        // Oluşturan admin'i de otomatik ekle (eğer listede yoksa)
        const adminIdsSet = new Set(dto.adminIds);
        if (!adminIdsSet.has(event.createdById)) {
          adminIdsSet.add(event.createdById);
        }

        const eventAdmins = Array.from(adminIdsSet).map((adminId) =>
          this.eventAdminsRepository.create({ eventId: id, adminId }),
        );

        await this.eventAdminsRepository.save(eventAdmins);
      } else {
        // Eğer boş liste gönderilirse, sadece oluşturan admin'i ekle
        const eventAdmin = this.eventAdminsRepository.create({
          eventId: id,
          adminId: event.createdById,
        });
        await this.eventAdminsRepository.save(eventAdmin);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number, userId?: number, userRole?: RoleName) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['eventAdmins'],
    });
    if (!event) {
      throw new NotFoundException('Etkinlik bulunamadi.');
    }

    // Yetki kontrolü
    if (userRole === RoleName.ADMIN && userId) {
      const hasAccess =
        event.createdById === userId ||
        event.eventAdmins?.some((ea) => ea.adminId === userId) ||
        false;
      if (!hasAccess) {
        throw new ForbiddenException('Bu etkinlik uzerinde yetkiniz yok.');
      }
    }

    await this.eventsRepository.remove(event);
    return { message: 'Etkinlik silindi.' };
  }

  async updateTags(eventId: number, dto: UpdateEventTagsDto, userId?: number, userRole?: RoleName) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['eventAdmins'],
    });
    if (!event) {
      throw new NotFoundException('Etkinlik bulunamadi.');
    }

    // Yetki kontrolü
    if (userRole === RoleName.ADMIN && userId) {
      const hasAccess =
        event.createdById === userId ||
        event.eventAdmins?.some((ea) => ea.adminId === userId) ||
        false;
      if (!hasAccess) {
        throw new ForbiddenException('Bu etkinlik uzerinde yetkiniz yok.');
      }
    }

    const tagIds = dto.tagIds || [];
    if (tagIds.length > 0) {
      const tags = await this.tagsRepository.find({ where: { id: In(tagIds) } });
      if (tags.length !== tagIds.length) {
        throw new BadRequestException('Etiketlerden bazi bulunamadi.');
      }
    }

    await this.eventTagsRepository.delete({ eventId });

    if (tagIds.length > 0) {
      const newRelations = tagIds.map((tagId) =>
        this.eventTagsRepository.create({ eventId, tagId }),
      );
      await this.eventTagsRepository.save(newRelations);
    }

    return this.findOne(eventId);
  }
}
