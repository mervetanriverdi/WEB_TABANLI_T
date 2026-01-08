import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventTag } from './event-tag.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => EventTag, (eventTag) => eventTag.tag)
  eventTags: EventTag[];
}
