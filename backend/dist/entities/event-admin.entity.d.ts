import { Event } from './event.entity';
import { User } from './user.entity';
export declare class EventAdmin {
    eventId: number;
    adminId: number;
    event: Event;
    admin: User;
}
