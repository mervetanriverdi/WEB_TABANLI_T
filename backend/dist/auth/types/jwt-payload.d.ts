import { RoleName } from '../../roles/role-name.enum';
export interface JwtPayload {
    sub: number;
    role: RoleName;
    email: string;
    name: string;
}
