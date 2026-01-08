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
exports.RegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("../entities/event.entity");
const registration_entity_1 = require("../entities/registration.entity");
let RegistrationsService = class RegistrationsService {
    constructor(registrationsRepository, eventsRepository) {
        this.registrationsRepository = registrationsRepository;
        this.eventsRepository = eventsRepository;
    }
    async create(dto, userId) {
        const event = await this.eventsRepository.findOne({ where: { id: dto.eventId } });
        if (!event) {
            throw new common_1.NotFoundException('Etkinlik bulunamadi.');
        }
        const existing = await this.registrationsRepository.findOne({
            where: { userId, eventId: dto.eventId },
        });
        if (existing) {
            throw new common_1.BadRequestException('Bu etkinlige zaten kayitlisiniz.');
        }
        const registration = this.registrationsRepository.create({
            userId,
            eventId: dto.eventId,
        });
        return this.registrationsRepository.save(registration);
    }
    async remove(id, userId) {
        const registration = await this.registrationsRepository.findOne({ where: { id } });
        if (!registration) {
            throw new common_1.NotFoundException('Kayit bulunamadi.');
        }
        if (registration.userId !== userId) {
            throw new common_1.ForbiddenException('Bu kaydi silemezsiniz.');
        }
        await this.registrationsRepository.remove(registration);
        return { message: 'Kayit iptal edildi.' };
    }
    async findMine(userId) {
        return this.registrationsRepository.find({
            where: { userId },
            relations: ['event'],
            order: { createdAt: 'DESC' },
        });
    }
    async findAll() {
        return this.registrationsRepository.find({
            relations: ['event', 'user'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.RegistrationsService = RegistrationsService;
exports.RegistrationsService = RegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(registration_entity_1.Registration)),
    __param(1, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RegistrationsService);
//# sourceMappingURL=registrations.service.js.map