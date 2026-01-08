import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RoleName } from '../roles/role-name.enum';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventTagsDto } from './dto/update-event-tags.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MEMBER)
  findAll(@Req() req: Request) {
    const user = req.user as { userId: number; role: string };
    return this.eventsService.findAll(user.userId, user.role as RoleName);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MEMBER)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { userId: number; role: string };
    return this.eventsService.findOne(id, user.userId, user.role as RoleName);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  create(@Body() dto: CreateEventDto, @Req() req: Request) {
    const user = req.user as { userId: number };
    return this.eventsService.create(dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: number; role: string };
    return this.eventsService.update(id, dto, user.userId, user.role as RoleName);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { userId: number; role: string };
    return this.eventsService.remove(id, user.userId, user.role as RoleName);
  }

  @Put(':id/tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  updateTags(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventTagsDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: number; role: string };
    return this.eventsService.updateTags(id, dto, user.userId, user.role as RoleName);
  }
}
