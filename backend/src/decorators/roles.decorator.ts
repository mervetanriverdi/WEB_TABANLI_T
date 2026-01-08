import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../roles/role-name.enum';

export const Roles = (...roles: RoleName[]) => SetMetadata('roles', roles);
