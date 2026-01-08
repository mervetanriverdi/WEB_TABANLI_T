import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

@Entity('event_admins')
@Index(['eventId', 'adminId'], { unique: true })
export class EventAdmin {
  @PrimaryColumn()
  eventId: number;

  @PrimaryColumn()
  adminId: number;

  @ManyToOne(() => Event, (event) => event.eventAdmins, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User, (user) => user.managedEvents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: User;
}




