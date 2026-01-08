import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { RoleName } from '../roles/role-name.enum';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
  ) {}

  async findAll() {
    return this.usersRepository.find({ relations: ['role'] });
  }

  async updateRole(id: number, dto: UpdateUserRoleDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Kullanici bulunamadi.');
    }

    const role = await this.rolesRepository.findOne({
      where: { name: dto.roleName as RoleName },
    });

    if (!role) {
      throw new BadRequestException('Rol bulunamadi.');
    }

    // roleId'yi güncelle
    await this.usersRepository.update(id, { roleId: role.id });

    // Güncellenmiş kullanıcıyı döndür
    const updatedUser = await this.usersRepository.findOne({ where: { id }, relations: ['role'] });
    if (!updatedUser) {
      throw new NotFoundException('Kullanici guncelleme sonrasi bulunamadi.');
    }

    return updatedUser;
  }
}
