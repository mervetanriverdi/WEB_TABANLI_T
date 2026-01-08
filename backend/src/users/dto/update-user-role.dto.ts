import { IsIn } from 'class-validator';
import { RoleName } from '../../roles/role-name.enum';

export class UpdateUserRoleDto {
  @IsIn([RoleName.ADMIN, RoleName.MEMBER], {
    message: 'Rol ADMIN veya MEMBER olmalidir.',
  })
  roleName: RoleName;
}
