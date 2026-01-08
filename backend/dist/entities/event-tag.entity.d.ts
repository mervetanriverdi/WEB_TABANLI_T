import { Event } from './event.entity';
import { Tag } from './tag.entity';
export declare class EventTag {
    eventId: number;
    tagId: number;
    event: Event;
    tag: Tag;
}
