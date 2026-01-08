import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoleName } from '../roles/role-name.enum';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: RoleName;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
