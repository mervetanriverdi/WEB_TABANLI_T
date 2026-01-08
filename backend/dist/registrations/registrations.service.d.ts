import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { Registration } from '../entities/registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
export declare class RegistrationsService {
    private readonly registrationsRepository;
    private readonly eventsRepository;
    constructor(registrationsRepository: Repository<Registration>, eventsRepository: Repository<Event>);
    create(dto: CreateRegistrationDto, userId: number): Promise<Registration>;
    remove(id: number, userId: number): Promise<{
        message: string;
    }>;
    findMine(userId: number): Promise<Registration[]>;
    findAll(): Promise<Registration[]>;
}
