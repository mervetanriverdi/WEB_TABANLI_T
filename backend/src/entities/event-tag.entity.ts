import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Event } from './event.entity';
import { Tag } from './tag.entity';

@Entity('event_tags')
export class EventTag {
  @PrimaryColumn()
  eventId: number;

  @PrimaryColumn()
  tagId: number;

  @ManyToOne(() => Event, (event) => event.eventTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => Tag, (tag) => tag.eventTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagId' })
  tag: Tag;
}
