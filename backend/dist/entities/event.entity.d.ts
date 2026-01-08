import { User } from './user.entity';
import { EventTag } from './event-tag.entity';
import { Registration } from './registration.entity';
import { Comment } from './comment.entity';
import { EventAdmin } from './event-admin.entity';
export declare class Event {
    id: number;
    title: string;
    description: string;
    location: string;
    startAt: Date;
    endAt: Date;
    capacity: number;
    createdById: number;
    createdBy: User;
    eventTags: EventTag[];
    registrations: Registration[];
    comments: Comment[];
    eventAdmins: EventAdmin[];
}
