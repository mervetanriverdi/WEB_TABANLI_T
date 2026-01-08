import { Role } from './role.entity';
import { Event } from './event.entity';
import { Registration } from './registration.entity';
import { Comment } from './comment.entity';
import { EventAdmin } from './event-admin.entity';
export declare class User {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    roleId: number;
    role: Role;
    createdAt: Date;
    createdEvents: Event[];
    registrations: Registration[];
    comments: Comment[];
    managedEvents: EventAdmin[];
}
