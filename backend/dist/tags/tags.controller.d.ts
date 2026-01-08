import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';
export declare class TagsController {
    private readonly tagsService;
    constructor(tagsService: TagsService);
    findAll(): Promise<import("../entities/tag.entity").Tag[]>;
    create(dto: CreateTagDto): Promise<import("../entities/tag.entity").Tag>;
    update(id: number, dto: UpdateTagDto): Promise<import("../entities/tag.entity").Tag>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
