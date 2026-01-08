import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Event } from '../entities/event.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
  ) {}

  async findByEvent(eventId: number) {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Etkinlik bulunamadi.');
    }

    return this.commentsRepository.find({
      where: { eventId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateCommentDto, userId: number) {
    const event = await this.eventsRepository.findOne({ where: { id: dto.eventId } });
    if (!event) {
      throw new NotFoundException('Etkinlik bulunamadi.');
    }

    const comment = this.commentsRepository.create({
      eventId: dto.eventId,
      userId,
      content: dto.content,
    });

    return this.commentsRepository.save(comment);
  }

  async removeOwn(id: number, userId: number) {
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Yorum bulunamadi.');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('Bu yorumu silemezsiniz.');
    }

    await this.commentsRepository.remove(comment);
    return { message: 'Yorum silindi.' };
  }

  async findAll() {
    return this.commentsRepository.find({
      relations: ['user', 'event'],
      order: { createdAt: 'DESC' },
    });
  }

  async removeAny(id: number) {
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Yorum bulunamadi.');
    }

    await this.commentsRepository.remove(comment);
    return { message: 'Yorum silindi.' };
  }
}
