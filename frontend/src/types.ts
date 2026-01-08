export type RoleName = 'ADMIN' | 'MEMBER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: RoleName;
}

export interface Tag {
  id: number;
  name: string;
}

export interface EventTag {
  eventId: number;
  tagId: number;
  tag?: Tag;
}

export interface EventAdmin {
  eventId: number;
  adminId: number;
  admin?: User;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  capacity: number;
  createdById?: number;
  createdBy?: User;
  eventTags?: EventTag[];
  eventAdmins?: EventAdmin[];
}

export interface Registration {
  id: number;
  userId: number;
  eventId: number;
  createdAt: string;
  event?: Event;
  user?: User;
}

export interface Comment {
  id: number;
  userId: number;
  eventId: number;
  content: string;
  createdAt: string;
  user?: User;
  event?: Event;
}
