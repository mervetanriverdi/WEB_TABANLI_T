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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../entities/role.entity");
const user_entity_1 = require("../entities/user.entity");
const role_name_enum_1 = require("../roles/role-name.enum");
let AuthService = class AuthService {
    constructor(usersRepository, rolesRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.rolesRepository = rolesRepository;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.usersRepository.findOne({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.BadRequestException('Bu e-posta zaten kullaniliyor.');
        }
        const memberRole = await this.rolesRepository.findOne({
            where: { name: role_name_enum_1.RoleName.MEMBER },
        });
        if (!memberRole) {
            throw new common_1.BadRequestException('Uye rolu bulunamadi.');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = this.usersRepository.create({
            name: dto.name,
            email: dto.email,
            passwordHash,
            roleId: memberRole.id,
        });
        const saved = await this.usersRepository.save(user);
        return {
            id: saved.id,
            name: saved.name,
            email: saved.email,
            role: memberRole.name,
        };
    }
    async login(dto) {
        const user = await this.usersRepository.findOne({
            where: { email: dto.email },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('E-posta veya sifre hatali.');
        }
        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('E-posta veya sifre hatali.');
        }
        const payload = {
            sub: user.id,
            role: user.role.name,
            email: user.email,
            name: user.name,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        return {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map