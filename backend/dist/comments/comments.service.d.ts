import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Event } from '../entities/event.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
export declare class CommentsService {
    private readonly commentsRepository;
    private readonly eventsRepository;
    constructor(commentsRepository: Repository<Comment>, eventsRepository: Repository<Event>);
    findByEvent(eventId: number): Promise<Comment[]>;
    create(dto: CreateCommentDto, userId: number): Promise<Comment>;
    removeOwn(id: number, userId: number): Promise<{
        message: string;
    }>;
    findAll(): Promise<Comment[]>;
    removeAny(id: number): Promise<{
        message: string;
    }>;
}
