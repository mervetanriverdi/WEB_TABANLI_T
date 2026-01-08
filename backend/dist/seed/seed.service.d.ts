import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
export declare class SeedService implements OnModuleInit {
    private readonly rolesRepository;
    private readonly usersRepository;
    private readonly logger;
    constructor(rolesRepository: Repository<Role>, usersRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    private ensureRoles;
    private ensureAdminUser;
}
