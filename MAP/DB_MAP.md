# Database Map

## Tables
- Role: roller (ADMIN, MEMBER).
- User: kullanici bilgileri ve rol baglantisi.
- Event: etkinlik bilgileri ve olusturan kullanici.
- Tag: etiketler.
- EventTag: etkinlik-etiket N-N baglantisi.
- EventAdmin: etkinlik-yonetici N-N baglantisi (etkinlik bazli admin yetkilendirmesi).
- Registration: kullanici-etkinlik kayitlari.
- Comment: etkinlik yorumlari.

## Relationships
- 1-N: Role -> User (User.roleId).
- 1-N: User -> Event (Event.createdById).
- N-N: Event <-> Tag (EventTag uzerinden).
- N-N: Event <-> User (EventAdmin uzerinden, etkinlik bazli admin yetkilendirmesi).
- 1-N: User -> Registration, Event -> Registration.
- 1-N: User -> Comment, Event -> Comment.

## Constraints
- Role.name unique.
- User.email unique.
- Tag.name unique.
- Registration (userId, eventId) unique.
- EventTag composite PK (eventId, tagId).
- EventAdmin composite PK (eventId, adminId) unique.

## Indexes
- Registration: (userId, eventId) unique index.
- EventTag: (eventId, tagId) composite PK.
- EventAdmin: (eventId, adminId) composite PK unique index.

## Notes
- Veri tipi ve iliskiler backend entity'leri ile uyumludur.
