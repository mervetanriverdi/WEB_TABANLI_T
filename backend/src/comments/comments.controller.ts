import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RoleName } from '../roles/role-name.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('events/:id/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MEMBER)
  findByEvent(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findByEvent(id);
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.MEMBER)
  create(@Body() dto: CreateCommentDto, @Req() req: Request) {
    const user = req.user as { userId: number };
    return this.commentsService.create(dto, user.userId);
  }

  @Get('comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  findAll() {
    return this.commentsService.findAll();
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MEMBER)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { userId: number; role: RoleName };
    if (user.role === RoleName.ADMIN) {
      return this.commentsService.removeAny(id);
    }
    return this.commentsService.removeOwn(id, user.userId);
  }
}
