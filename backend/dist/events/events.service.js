"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("../entities/event.entity");
const event_tag_entity_1 = require("../entities/event-tag.entity");
const event_admin_entity_1 = require("../entities/event-admin.entity");
const tag_entity_1 = require("../entities/tag.entity");
const user_entity_1 = require("../entities/user.entity");
const role_name_enum_1 = require("../roles/role-name.enum");
let EventsService = class EventsService {
    constructor(eventsRepository, tagsRepository, eventTagsRepository, eventAdminsRepository, usersRepository) {
        this.eventsRepository = eventsRepository;
        this.tagsRepository = tagsRepository;
        this.eventTagsRepository = eventTagsRepository;
        this.eventAdminsRepository = eventAdminsRepository;
        this.usersRepository = usersRepository;
    }
    async findAll(userId, userRole) {
        const events = await this.eventsRepository.find({
            relations: ['createdBy', 'eventTags', 'eventTags.tag', 'eventAdmins', 'eventAdmins.admin'],
            order: { startAt: 'ASC' },
        });
        if (userRole === role_name_enum_1.RoleName.ADMIN && userId) {
            return events.filter((event) => {
                if (event.createdById === userId)
                    return true;
                return event.eventAdmins?.some((ea) => ea.adminId === userId) || false;
            });
        }
        return events;
    }
    async findOne(id, userId, userRole) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['createdBy', 'eventTags', 'eventTags.tag', 'eventAdmins', 'eventAdmins.admin'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Etkinlik bulunamadi.');
        }
        if (userRole === role_name_enum_1.RoleName.ADMIN && userId) {
            const hasAccess = event.createdById === userId ||
                event.eventAdmins?.some((ea) => ea.adminId === userId) ||
                false;
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Bu etkinlik uzerinde yetkiniz yok.');
            }
        }
        return event;
    }
    async create(dto, createdById) {
        const event = this.eventsRepository.create({
            title: dto.title,
            description: dto.description,
            location: dto.location,
            startAt: new Date(dto.startAt),
            endAt: new Date(dto.endAt),
            capacity: dto.capacity,
            createdById,
        });
        const savedEvent = await this.eventsRepository.save(event);
        if (dto.adminIds && dto.adminIds.length > 0) {
            const admins = await this.usersRepository.find({
                where: { id: (0, typeorm_2.In)(dto.adminIds), role: { name: role_name_enum_1.RoleName.ADMIN } },
                relations: ['role'],
            });
            if (admins.length !== dto.adminIds.length) {
                throw new common_1.BadRequestException('Secilen kullanicilardan bazilari admin degil veya bulunamadi.');
            }
            const adminIdsSet = new Set(dto.adminIds);
            if (!adminIdsSet.has(createdById)) {
                adminIdsSet.add(createdById);
            }
            const eventAdmins = Array.from(adminIdsSet).map((adminId) => this.eventAdminsRepository.create({ eventId: savedEvent.id, adminId }));
            await this.eventAdminsRepository.save(eventAdmins);
        }
        else {
            const eventAdmin = this.eventAdminsRepository.create({
                eventId: savedEvent.id,
                adminId: createdById,
            });
            await this.eventAdminsRepository.save(eventAdmin);
        }
        return this.findOne(savedEvent.id);
    }
    async update(id, dto, userId, userRole) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['eventAdmins'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Etkinlik bulunamadi.');
        }
        if (userRole === role_name_enum_1.RoleName.ADMIN && userId) {
            const hasAccess = event.createdById === userId ||
                event.eventAdmins?.some((ea) => ea.adminId === userId) ||
                false;
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Bu etkinlik uzerinde yetkiniz yok.');
            }
        }
        const updated = {
            ...event,
            ...dto,
            startAt: dto.startAt ? new Date(dto.startAt) : event.startAt,
            endAt: dto.endAt ? new Date(dto.endAt) : event.endAt,
        };
        await this.eventsRepository.save(updated);
        if (dto.adminIds !== undefined) {
            await this.eventAdminsRepository.delete({ eventId: id });
            if (dto.adminIds.length > 0) {
                const admins = await this.usersRepository.find({
                    where: { id: (0, typeorm_2.In)(dto.adminIds), role: { name: role_name_enum_1.RoleName.ADMIN } },
                    relations: ['role'],
                });
                if (admins.length !== dto.adminIds.length) {
                    throw new common_1.BadRequestException('Secilen kullanicilardan bazilari admin degil veya bulunamadi.');
                }
                const adminIdsSet = new Set(dto.adminIds);
                if (!adminIdsSet.has(event.createdById)) {
                    adminIdsSet.add(event.createdById);
                }
                const eventAdmins = Array.from(adminIdsSet).map((adminId) => this.eventAdminsRepository.create({ eventId: id, adminId }));
                await this.eventAdminsRepository.save(eventAdmins);
            }
            else {
                const eventAdmin = this.eventAdminsRepository.create({
                    eventId: id,
                    adminId: event.createdById,
                });
                await this.eventAdminsRepository.save(eventAdmin);
            }
        }
        return this.findOne(id);
    }
    async remove(id, userId, userRole) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['eventAdmins'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Etkinlik bulunamadi.');
        }
        if (userRole === role_name_enum_1.RoleName.ADMIN && userId) {
            const hasAccess = event.createdById === userId ||
                event.eventAdmins?.some((ea) => ea.adminId === userId) ||
                false;
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Bu etkinlik uzerinde yetkiniz yok.');
            }
        }
        await this.eventsRepository.remove(event);
        return { message: 'Etkinlik silindi.' };
    }
    async updateTags(eventId, dto, userId, userRole) {
        const event = await this.eventsRepository.findOne({
            where: { id: eventId },
            relations: ['eventAdmins'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Etkinlik bulunamadi.');
        }
        if (userRole === role_name_enum_1.RoleName.ADMIN && userId) {
            const hasAccess = event.createdById === userId ||
                event.eventAdmins?.some((ea) => ea.adminId === userId) ||
                false;
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Bu etkinlik uzerinde yetkiniz yok.');
            }
        }
        const tagIds = dto.tagIds || [];
        if (tagIds.length > 0) {
            const tags = await this.tagsRepository.find({ where: { id: (0, typeorm_2.In)(tagIds) } });
            if (tags.length !== tagIds.length) {
                throw new common_1.BadRequestException('Etiketlerden bazi bulunamadi.');
            }
        }
        await this.eventTagsRepository.delete({ eventId });
        if (tagIds.length > 0) {
            const newRelations = tagIds.map((tagId) => this.eventTagsRepository.create({ eventId, tagId }));
            await this.eventTagsRepository.save(newRelations);
        }
        return this.findOne(eventId);
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(2, (0, typeorm_1.InjectRepository)(event_tag_entity_1.EventTag)),
    __param(3, (0, typeorm_1.InjectRepository)(event_admin_entity_1.EventAdmin)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EventsService);
//# sourceMappingURL=events.service.js.map