import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { RoleName } from '../roles/role-name.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly usersRepository;
    private readonly rolesRepository;
    private readonly jwtService;
    constructor(usersRepository: Repository<User>, rolesRepository: Repository<Role>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        id: number;
        name: string;
        email: string;
        role: RoleName;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: RoleName;
        };
    }>;
}
