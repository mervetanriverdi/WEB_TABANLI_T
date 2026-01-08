import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
export declare class TagsService {
    private readonly tagsRepository;
    constructor(tagsRepository: Repository<Tag>);
    findAll(): Promise<Tag[]>;
    create(dto: CreateTagDto): Promise<Tag>;
    update(id: number, dto: UpdateTagDto): Promise<Tag>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
