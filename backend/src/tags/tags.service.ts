import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(@InjectRepository(Tag) private readonly tagsRepository: Repository<Tag>) {}

  async findAll() {
    return this.tagsRepository.find();
  }

  async create(dto: CreateTagDto) {
    const existing = await this.tagsRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException('Bu etiket adi zaten kullaniliyor.');
    }

    const tag = this.tagsRepository.create({ name: dto.name });
    return this.tagsRepository.save(tag);
  }

  async update(id: number, dto: UpdateTagDto) {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Etiket bulunamadi.');
    }

    if (dto.name && dto.name !== tag.name) {
      const existing = await this.tagsRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new BadRequestException('Bu etiket adi zaten kullaniliyor.');
      }
    }

    Object.assign(tag, dto);
    return this.tagsRepository.save(tag);
  }

  async remove(id: number) {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Etiket bulunamadi.');
    }

    await this.tagsRepository.remove(tag);
    return { message: 'Etiket silindi.' };
  }
}
