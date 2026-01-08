# Backend Yetkilendirme Denetim Raporu

## Ozet Tablo
| Kontrol | Durum | Not |
| --- | --- | --- |
| 1) MEMBER yalniz kendi yorumunu silebilir | PASS | Controller rol ayrimi + service sahiplik kontrolu |
| 2) MEMBER yalniz kendi kaydini silebilir | PASS | Service sahiplik kontrolu mevcut |
| 3) Auth basics | PASS | bcrypt hash/compare + JWT token + role bilgisi |
| 4) RBAC | PASS | Admin/member endpointleri JWT + RolesGuard ile korunmus |
| 5) Seed | PASS | OnModuleInit ile rol ve admin kullanici olusturuluyor |
| 6) DB constraints / schema | PASS | Entity alanlari ve iliskiler sema ile uyumlu |

## 1) MEMBER yalniz kendi yorumunu silebilir
- Bulgular: Delete endpoint, rolu ADMIN olan kullanici icin `removeAny`, MEMBER icin `removeOwn` cagiriyor; servis seviyesinde userId kontrolu var.
- Dosya: `backend/src/comments/comments.controller.ts` - Fonksiyon: `remove`
  - Alinti:
```
const user = req.user as { userId: number; role: RoleName };
if (user.role === RoleName.ADMIN) {
  return this.commentsService.removeAny(id);
}
return this.commentsService.removeOwn(id, user.userId);
```
- Dosya: `backend/src/comments/comments.service.ts` - Fonksiyon: `removeOwn`
  - Alinti:
```
if (comment.userId !== userId) {
  throw new ForbiddenException('Bu yorumu silemezsiniz.');
}
await this.commentsRepository.remove(comment);
```

## 2) MEMBER yalniz kendi kaydini silebilir
- Bulgular: Kayit silme servisinde userId sahiplik kontrolu var.
- Dosya: `backend/src/registrations/registrations.service.ts` - Fonksiyon: `remove`
  - Alinti:
```
if (registration.userId !== userId) {
  throw new ForbiddenException('Bu kaydi silemezsiniz.');
}
await this.registrationsRepository.remove(registration);
```

## 3) Auth basics
- Bulgular: Kayit sirasinda bcrypt hash, giriste bcrypt compare ve JWT token uretimi; login response icinde rol bilgisi var.
- Dosya: `backend/src/auth/auth.service.ts` - Fonksiyon: `register`
  - Alinti:
```
const passwordHash = await bcrypt.hash(dto.password, 10);
const user = this.usersRepository.create({
  name: dto.name,
  email: dto.email,
  passwordHash,
});
```
- Dosya: `backend/src/auth/auth.service.ts` - Fonksiyon: `login`
  - Alinti:
```
const isValid = await bcrypt.compare(dto.password, user.passwordHash);
const accessToken = await this.jwtService.signAsync(payload);
return { accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role.name } };
```

## 4) RBAC
- Bulgular: Admin endpointleri ve member endpointleri JWT + RolesGuard ile korunmus; /auth/* ve /health public.
- Dosya: `backend/src/users/users.controller.ts` - Fonksiyon: sinif seviyesi
  - Alinti:
```
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class UsersController {
```
- Dosya: `backend/src/events/events.controller.ts` - Fonksiyon: `findAll` ve `create`
  - Alinti:
```
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.MEMBER)
findAll() {
```
```
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
create(@Body() dto: CreateEventDto, @Req() req: Request) {
```
- Dosya: `backend/src/health/health.controller.ts` - Fonksiyon: `getHealth`
  - Alinti:
```
@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
```

## 5) Seed
- Bulgular: OnModuleInit ile roller ve admin kullanici olusturuluyor; SeedModule AppModule icinde import edilmis.
- Dosya: `backend/src/seed/seed.service.ts` - Fonksiyon: `onModuleInit` ve `ensureAdminUser`
  - Alinti:
```
async onModuleInit() {
  await this.ensureRoles();
  await this.ensureAdminUser();
}
```
```
const email = 'admin@campus.local';
const passwordHash = await bcrypt.hash('Admin123!', 10);
const adminUser = this.usersRepository.create({ name: 'Admin', email, passwordHash, roleId: adminRole.id });
```
- Dosya: `backend/src/app.module.ts` - Fonksiyon: `AppModule` imports
  - Alinti:
```
imports: [
  ...,
  SeedModule,
],
```

## 6) DB constraints / schema alignment
- Bulgular: Unique ve iliski tanimlari sema ile uyumlu. EventAdmin tablosu etkinlik bazli admin yetkilendirmesi icin eklenmistir.

## 7) Event bazli admin yetkilendirmesi
- Bulgular: EventAdmin entity'si ile etkinlik bazli admin yetkilendirmesi implement edilmistir. Admin'ler sadece kendi olusturduklari veya yetkilendirildikleri etkinlikleri gorebilir ve yonetebilir.
- Dosya: `backend/src/entities/event-admin.entity.ts`
  - Alinti:
```
@Entity('event_admins')
@Index(['eventId', 'adminId'], { unique: true })
export class EventAdmin {
  @PrimaryColumn()
  eventId: number;
  @PrimaryColumn()
  adminId: number;
```
- Dosya: `backend/src/events/events.service.ts` - Fonksiyon: `findAll`
  - Alinti:
```
if (userRole === RoleName.ADMIN) {
  query.where = [
    { createdById: userId },
    { eventAdmins: { adminId: userId } },
  ];
}
```
- Dosya: `backend/src/events/events.service.ts` - Fonksiyon: `create`
  - Alinti:
```
if (dto.adminIds && dto.adminIds.length > 0) {
  const eventAdmins = Array.from(adminIdsSet).map((adminId) =>
    this.eventAdminsRepository.create({ eventId: savedEvent.id, adminId }),
  );
  await this.eventAdminsRepository.save(eventAdmins);
}
```
- Dosya: `backend/src/entities/role.entity.ts` - Alan: `name`
  - Alinti:
```
@Column({ type: 'varchar', unique: true })
name: RoleName;
```
- Dosya: `backend/src/entities/user.entity.ts` - Alan: `email`, iliski: Role
  - Alinti:
```
@Column({ type: 'varchar', unique: true })
email: string;
@ManyToOne(() => Role, (role) => role.users, { eager: true })
```
- Dosya: `backend/src/entities/tag.entity.ts` - Alan: `name`
  - Alinti:
```
@Column({ type: 'varchar', unique: true })
name: string;
```
- Dosya: `backend/src/entities/registration.entity.ts` - Unique index
  - Alinti:
```
@Entity('registrations')
@Index(['userId', 'eventId'], { unique: true })
```
- Dosya: `backend/src/entities/event.entity.ts` - createdBy iliskisi
  - Alinti:
```
@Column()
createdById: number;
@ManyToOne(() => User, (user) => user.createdEvents)
```
- Dosya: `backend/src/entities/event-tag.entity.ts` - N-N baglanti
  - Alinti:
```
@PrimaryColumn()
eventId: number;
@PrimaryColumn()
tagId: number;
```
