import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("../entities/user.entity").User[]>;
    updateRole(id: number, dto: UpdateUserRoleDto): Promise<import("../entities/user.entity").User>;
}
