import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { RoleName } from '../roles/role-name.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.ensureRoles();
    await this.ensureAdminUser();
  }

  private async ensureRoles() {
    const roles = [RoleName.ADMIN, RoleName.MEMBER];
    for (const roleName of roles) {
      const existing = await this.rolesRepository.findOne({ where: { name: roleName } });
      if (!existing) {
        const role = this.rolesRepository.create({ name: roleName });
        await this.rolesRepository.save(role);
        this.logger.log(`Rol olusturuldu: ${roleName}`);
      }
    }
  }

  private async ensureAdminUser() {
    const email = 'admin@campus.local';
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      return;
    }

    const adminRole = await this.rolesRepository.findOne({ where: { name: RoleName.ADMIN } });
    if (!adminRole) {
      return;
    }

    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const adminUser = this.usersRepository.create({
      name: 'Admin',
      email,
      passwordHash,
      roleId: adminRole.id,
    });

    await this.usersRepository.save(adminUser);
    this.logger.log('Admin kullanici olusturuldu: admin@campus.local');
  }
}
