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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../entities/role.entity");
const user_entity_1 = require("../entities/user.entity");
const role_name_enum_1 = require("../roles/role-name.enum");
let SeedService = SeedService_1 = class SeedService {
    constructor(rolesRepository, usersRepository) {
        this.rolesRepository = rolesRepository;
        this.usersRepository = usersRepository;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onModuleInit() {
        await this.ensureRoles();
        await this.ensureAdminUser();
    }
    async ensureRoles() {
        const roles = [role_name_enum_1.RoleName.ADMIN, role_name_enum_1.RoleName.MEMBER];
        for (const roleName of roles) {
            const existing = await this.rolesRepository.findOne({ where: { name: roleName } });
            if (!existing) {
                const role = this.rolesRepository.create({ name: roleName });
                await this.rolesRepository.save(role);
                this.logger.log(`Rol olusturuldu: ${roleName}`);
            }
        }
    }
    async ensureAdminUser() {
        const email = 'admin@campus.local';
        const existing = await this.usersRepository.findOne({ where: { email } });
        if (existing) {
            return;
        }
        const adminRole = await this.rolesRepository.findOne({ where: { name: role_name_enum_1.RoleName.ADMIN } });
        if (!adminRole) {
            return;
        }
        const passwordHash = await bcrypt.hash('Admin123!', 10);
        const adminUser = this.usersRepository.create({
            name: 'Admin',
            email,
            passwordHash,
            roleId: adminRole.id,
        });
        await this.usersRepository.save(adminUser);
        this.logger.log('Admin kullanici olusturuldu: admin@campus.local');
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map