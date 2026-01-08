import { User } from './user.entity';
import { Event } from './event.entity';
export declare class Registration {
    id: number;
    userId: number;
    eventId: number;
    user: User;
    event: Event;
    createdAt: Date;
}
