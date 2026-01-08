import { Request } from 'express';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    findByEvent(id: number): Promise<import("../entities/comment.entity").Comment[]>;
    create(dto: CreateCommentDto, req: Request): Promise<import("../entities/comment.entity").Comment>;
    findAll(): Promise<import("../entities/comment.entity").Comment[]>;
    remove(id: number, req: Request): Promise<{
        message: string;
    }>;
}
