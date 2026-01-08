import { RoleName } from '../roles/role-name.enum';
import { User } from './user.entity';
export declare class Role {
    id: number;
    name: RoleName;
    users: User[];
}
