import { Request } from 'express';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventTagsDto } from './dto/update-event-tags.dto';
import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    findAll(req: Request): Promise<import("../entities/event.entity").Event[]>;
    findOne(id: number, req: Request): Promise<import("../entities/event.entity").Event>;
    create(dto: CreateEventDto, req: Request): Promise<import("../entities/event.entity").Event>;
    update(id: number, dto: UpdateEventDto, req: Request): Promise<import("../entities/event.entity").Event>;
    remove(id: number, req: Request): Promise<{
        message: string;
    }>;
    updateTags(id: number, dto: UpdateEventTagsDto, req: Request): Promise<import("../entities/event.entity").Event>;
}
