import { RoleName } from '../../roles/role-name.enum';

export class LoginResponseDto {
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: RoleName;
  };
}
