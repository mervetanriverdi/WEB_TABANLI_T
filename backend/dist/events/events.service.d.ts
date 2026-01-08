import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { EventTag } from '../entities/event-tag.entity';
import { EventAdmin } from '../entities/event-admin.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventTagsDto } from './dto/update-event-tags.dto';
import { RoleName } from '../roles/role-name.enum';
export declare class EventsService {
    private readonly eventsRepository;
    private readonly tagsRepository;
    private readonly eventTagsRepository;
    private readonly eventAdminsRepository;
    private readonly usersRepository;
    constructor(eventsRepository: Repository<Event>, tagsRepository: Repository<Tag>, eventTagsRepository: Repository<EventTag>, eventAdminsRepository: Repository<EventAdmin>, usersRepository: Repository<User>);
    findAll(userId?: number, userRole?: RoleName): Promise<Event[]>;
    findOne(id: number, userId?: number, userRole?: RoleName): Promise<Event>;
    create(dto: CreateEventDto, createdById: number): Promise<Event>;
    update(id: number, dto: UpdateEventDto, userId?: number, userRole?: RoleName): Promise<Event>;
    remove(id: number, userId?: number, userRole?: RoleName): Promise<{
        message: string;
    }>;
    updateTags(eventId: number, dto: UpdateEventTagsDto, userId?: number, userRole?: RoleName): Promise<Event>;
}
