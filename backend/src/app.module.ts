import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { EventsModule } from './events/events.module';
import { HealthController } from './health/health.controller';
import { RegistrationsModule } from './registrations/registrations.module';
import { RolesModule } from './roles/roles.module';
import { SeedModule } from './seed/seed.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    RolesModule,
    UsersModule,
    AuthModule,
    EventsModule,
    TagsModule,
    RegistrationsModule,
    CommentsModule,
    SeedModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
