import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
export declare class UsersService {
    private readonly usersRepository;
    private readonly rolesRepository;
    constructor(usersRepository: Repository<User>, rolesRepository: Repository<Role>);
    findAll(): Promise<User[]>;
    updateRole(id: number, dto: UpdateUserRoleDto): Promise<User>;
}
