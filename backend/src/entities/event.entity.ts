import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { EventTag } from './event-tag.entity';
import { Registration } from './registration.entity';
import { Comment } from './comment.entity';
import { EventAdmin } from './event-admin.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'timestamp' })
  startAt: Date;

  @Column({ type: 'timestamp' })
  endAt: Date;

  @Column({ type: 'int' })
  capacity: number;

  @Column()
  createdById: number;

  @ManyToOne(() => User, (user) => user.createdEvents)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => EventTag, (eventTag) => eventTag.event, { cascade: true })
  eventTags: EventTag[];

  @OneToMany(() => Registration, (registration) => registration.event)
  registrations: Registration[];

  @OneToMany(() => Comment, (comment) => comment.event)
  comments: Comment[];

  @OneToMany(() => EventAdmin, (eventAdmin) => eventAdmin.event, { cascade: true })
  eventAdmins: EventAdmin[];
}
