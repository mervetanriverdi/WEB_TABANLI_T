import { User } from './user.entity';
import { Event } from './event.entity';
export declare class Comment {
    id: number;
    userId: number;
    eventId: number;
    content: string;
    user: User;
    event: Event;
    createdAt: Date;
}
