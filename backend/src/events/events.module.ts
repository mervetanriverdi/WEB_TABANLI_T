import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../entities/event.entity';
import { EventTag } from '../entities/event-tag.entity';
import { EventAdmin } from '../entities/event-admin.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Tag, EventTag, EventAdmin, User])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
