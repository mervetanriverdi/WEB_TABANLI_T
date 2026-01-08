import { RoleName } from '../../roles/role-name.enum';
export declare class LoginResponseDto {
    accessToken: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: RoleName;
    };
}
